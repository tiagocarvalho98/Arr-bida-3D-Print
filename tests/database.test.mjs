import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

const owner='00000000-0000-0000-0000-000000000001';
const partner='00000000-0000-0000-0000-000000000002';
const stranger='00000000-0000-0000-0000-000000000003';
async function database(){
  const db=new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid() to authenticated;`);
  for(const file of (await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort()){
    await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
  }
  return db;
}
async function fixtures(db){
  await db.exec(`insert into auth.users values ('${owner}'),('${partner}'),('${stranger}');
    insert into public.profiles(id,display_name,role) values ('${owner}','Owner','owner'),('${partner}','Partner','collaborator');
    insert into public.clients(id,name) values ('10000000-0000-0000-0000-000000000001','Client');
    insert into public.orders(id,client_id,title) values ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Sign');`);
}
async function asUser(db,id){await db.exec(`reset role; select set_config('request.jwt.claim.sub','${id}',false); set role authenticated;`);}

test('migration creates empty tables, enables RLS and exposes no privileged public functions',async()=>{
  const db=await database();
  try{
    const {rows}=await db.query("select tablename from pg_tables where schemaname='public'");
    assert.equal(rows.length,15);
    for(const {tablename} of rows){
      assert.equal((await db.query(`select count(*)::int as n from public.${tablename}`)).rows[0].n,0);
    }
    assert.equal((await db.query("select count(*)::int n from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity")).rows[0].n,0);
    assert.equal((await db.query("select count(*)::int n from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prosecdef")).rows[0].n,0);
  }finally{await db.close();}
});

test('all active collaborators read shared orders; strangers, inactive members and anon cannot',async()=>{
  const db=await database();
  try{
    await fixtures(db);
    for(const id of [owner,partner]){
      await asUser(db,id);
      assert.equal((await db.query('select count(*)::int n from public.orders')).rows[0].n,1);
      await assert.rejects(db.exec("update public.orders set title='Changed'"),/permission denied/);
      await assert.rejects(db.exec("update public.profiles set role='owner'"),/permission denied/);
    }
    await asUser(db,stranger);
    assert.equal((await db.query('select count(*)::int n from public.clients')).rows[0].n,0);
    await db.exec(`reset role; update public.profiles set active=false where id='${partner}';`);
    await asUser(db,partner);
    assert.equal((await db.query('select count(*)::int n from public.orders')).rows[0].n,0);
    await db.exec('reset role; set role anon;');
    await assert.rejects(db.query('select * from public.clients'),/permission denied/);
  }finally{await db.close();}
});

test('chosen pipeline rejects duplicates, wrong order and quotes for fixed-price orders',async()=>{
  const db=await database();
  try{
    await fixtures(db);
    await db.exec(`update public.orders set route='{accepted,production,delivered}',status='accepted',accepted_by='${owner}',accepted_at=now()`);
    for(const route of ["{accepted,quote,quote,delivered}","{accepted,ready,production,delivered}","{accepted,production}","{NULL,production,delivered}","{accepted,unknown,delivered}"]){
      await assert.rejects(db.query('update public.orders set route=$1::text[]',[route]),/check constraint/);
    }
    await assert.rejects(db.exec("update public.orders set pricing_mode='known', route='{accepted,quote,delivered}'"),/check constraint/);
    await db.exec(`update public.orders set route='{accepted,production,delivered}',status='accepted',accepted_by='${owner}',accepted_at=now()`);
    await assert.rejects(db.exec("update public.orders set status='quote'"),/check constraint/);
  }finally{await db.close();}
});

test('multi-filament quotations preserve cost snapshots without stock consumption',async()=>{
  const db=await database();
  try{
    await fixtures(db);
    await db.exec(`insert into public.filament_lots(id,material,color,received_grams,purchase_cost_milli_euro) values
      ('30000000-0000-0000-0000-000000000001','PLA','Black',1000,20000),
      ('30000000-0000-0000-0000-000000000002','PETG','White',1000,30000);
      insert into public.quotations(id,order_id,duration_minutes,hourly_rate_milli_euro,final_milli_euro,submitted_by)
      values ('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',90,10000,45000,'${owner}');
      insert into public.quotation_materials(quotation_id,lot_id,material,color,grams,lot_received_grams,lot_purchase_cost_milli_euro) values
      ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','PLA','Black',100,1000,20000),
      ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','PETG','White',50,1000,30000);`);
    assert.equal(Number((await db.query('select sum(material_milli_euro) n from public.quotation_materials')).rows[0].n),3500);
    assert.equal(Number((await db.query('select time_milli_euro n from public.quotations')).rows[0].n),15000);
    await db.exec('update public.filament_lots set purchase_cost_milli_euro=90000');
    assert.equal(Number((await db.query('select sum(material_milli_euro) n from public.quotation_materials')).rows[0].n),3500);
    assert.equal((await db.query('select count(*)::int n from public.stock_movements')).rows[0].n,0);
    assert.equal((await db.query('select count(*)::int n from public.reservations')).rows[0].n,0);
    await assert.rejects(db.exec(`insert into public.quotation_materials
      (quotation_id,lot_id,material,color,grams,lot_received_grams,lot_purchase_cost_milli_euro)
      select quotation_id,lot_id,material,color,grams,lot_received_grams,lot_purchase_cost_milli_euro
      from public.quotation_materials limit 1`),/duplicate key/);
    await assert.rejects(db.exec('update public.quotation_materials set grams=-1'),/check constraint/);
    await assert.rejects(db.exec('delete from public.clients'),/foreign key/);
  }finally{await db.close();}
});

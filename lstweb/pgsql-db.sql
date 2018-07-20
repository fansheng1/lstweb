-- import uuid_xxx
create extension "uuid-ossp";
select uuid_generate_v4();

-- clean type used by database function
drop type capture_item;
drop type uuid_set;
drop type search_item;
drop type search_track_item;

-- add admin account
create or replace function init_db() returns void as $$
declare
	def_root_user_id uuid;
	def_role_id uuid;
	def_role_user_rel_id uuid;
	def_camera_group_id uuid;
begin
	def_camera_group_id := 'b03d96a8-e2bd-11e0-8dae-000f1f79ca39';
	def_root_user_id := uuid_generate_v4();
	def_role_id := uuid_generate_v4();
	def_role_user_rel_id := uuid_generate_v4();

	-- add camera default grooup
	insert into camera_group (group_id, g_name,g_remark,g_removed,g_type)
		values (def_camera_group_id, '默认配置组','初始摄像机组',false,true);

	-- add root user
	insert into users (user_id,user_name,u_name,u_passwd,u_creatime,u_updatetime,u_removed)
		values (def_root_user_id,'admin','管理员','admin',now(),now(),false);
	insert into role (role_id,role_name,r_removed,role_remark,create_time,last_modify)
		values (def_role_id,'管理员组',false,'初始管理组',now(),now());
	insert into user_role (ur_id,user_id,role_id)
		values (def_role_user_rel_id,def_root_user_id,def_role_id);

end
$$ language plpgsql;

-- create function
-- clean camera and conf group item
/* remove all of camera and config group relationship */
delete from camera_info;
delete from camera_group_rel where r_is_config='t';

-- sim add camera data
create or replace function add_camera_data(
	ip_prefix varchar, oui varchar, nr integer
) returns void as
$$
	declare n integer;
	declare len integer;
	declare ip varchar;
	declare mac varchar;
	declare m1 integer;
	declare m2 integer;
	declare m3 integer;
	declare cid uuid;
	declare def_gid uuid;

	begin
		def_gid := 'b03d96a8-e2bd-11e0-8dae-000f1f79ca39'; /* default config group id */

		for n in 1..nr loop
			cid := uuid_generate_v4();
			ip := "ip_prefix" || '.' || (10+n);
			m1 := cast((random()*(88)+10) as int);
			m2 := cast((random()*(88)+10) as int);
			m3 := cast((random()*(88)+10) as int);
			mac := oui || ':' || m1 || ':' || m2 || ':' || m3;
			insert into camera_info (c_ip,c_name,c_mac,c_up_to_time,c_version,c_longitude,c_lat,c_model,c_sysname,cid,
				c_on_monitor,c_on_record,c_on_capture,c_flag,c_last_update,c_removed,c_stream)
			values 
				(ip,'LST-name-' || n,mac, '25'||(n*2), '16.5.4','144.0','144.0','model-lst-5','Ubuntu Linux',cid,
				'f','f','f',0,now(),'f','');
			insert into camera_group_rel (r_group_id,r_camera_id,r_is_config,r_last_update,r_group_name,r_id)
			values 
				(def_gid, cid, 't', now(), 'default group', uuid_generate_v4());
		end loop;
	end;
$$
language plpgsql;

-- test for function
/* load sim camera data */
-- select add_camera_data('10.10.92','0e:34:54', 200);
-- select add_camera_data('10.10.55','0e:3f:44', 200);
-- select add_camera_data('10.10.32','0e:df:8a', 200);
-- select add_camera_data('10.10.82','0e:da:04', 200);

-- capture result filter rettype
create type capture_item as (capture_id uuid, cid uuid, "file" varchar, ts timestamp);

-- return last 'sec' seconds capture result
create or replace function get_capture_result_by_tid(
	"tid" uuid, "base_uri" varchar, sec integer
	) returns setof capture_item as 
$$
declare v_rec capture_item%rowtype;
declare cameras RECORD;
declare ts_offset timestamp;
begin

		select into cameras R.r_camera_id  as cam_id
			from task_info T , camera_group_rel R
			where T.task_id=tid AND T.cam_group_id=R.r_group_id;

		ts_offset := localtimestamp - cast( sec || ' seconds' as interval );

		for v_rec in (
			select capture_id, camera_id cid,  ("base_uri" || '/' || c_url) file_uuid, c_create_time ts
			from capture_result_store
			where camera_id in (
				select R.r_camera_id  as cam_id
				from task_info ti , camera_group_rel R
				where ti.task_id=tid and ti.cam_group_id=R.r_group_id
			) and c_create_time > ts_offset) loop
			return next v_rec;
		end loop;
		return;
end
$$ language plpgsql;

-- test script for above
-- select * from get_capture_result_by_tid(
-- '598bfeb4-917c-4547-9455-f4c188998921', 
-- '/nfsroot/controller', 106000)


-- return last 'sec' seconds capture result with pager capability
create or replace function get_capture_result_by_tid2(
	"tid" uuid, "base_uri" varchar, sec integer, "page" integer, "page_size" integer
	) returns setof capture_item as 
$$
-- sec:  last 'sec' seconds data
-- page: [1...n]
-- page_size:  item per return item count
declare
	v_rec capture_item%rowtype;
	cameras RECORD;
	ts_offset timestamp;
	start integer;
begin

		select into cameras R.r_camera_id  as cam_id
			from task_info T , camera_group_rel R
			where T.task_id=tid AND T.cam_group_id=R.r_group_id;

		ts_offset := localtimestamp - cast( sec || ' seconds' as interval );
		start := ( "page" - 1) * "page_size";

		for v_rec in (
			select capture_id, camera_id cid,  ("base_uri" || '/' || c_url) file_uuid, c_create_time ts
			from capture_result_store
			where camera_id in (
				select R.r_camera_id  as cam_id
				from task_info ti , camera_group_rel R
				where ti.task_id=tid and ti.cam_group_id=R.r_group_id
			) and c_create_time > ts_offset)
			order by c_create_time desc limit "page_size" offset "start" loop
			return next v_rec;
		end loop;
		return;
end
$$ language plpgsql;

-- test script for above
-- select * from get_capture_result_by_tid2(
-- 	'598bfeb4-917c-4547-9455-f4c188998921',
-- 	'/nfsroot/controller', 106000, 1, 5)


create type search_item as (
	comp_id uuid, cid uuid, cam_file varchar, 
	src_image varchar, src_video varchar, offset_video varchar,
	similarity float, ts timestamp);

create type uuid_set as (id uuid);

-- filter search result
create or replace function get_search_result_by_tid(
	"tid" uuid, "base_uri" varchar, "base_cam_uri" varchar, 
	sec integer, "page" integer, "page_size" integer
	) returns setof search_item as 
$$
-- tid:	task id (uuid)
-- base_uri: 	task resource file uri prefix for www access 
-- base_cam_uri:	compare file uri prefix
-- sec:	last 'sec' seconds data, 0 will return all of search results.
-- page: page number
-- page_size: pagesize
-- foxcafe@163.com
declare
	v_rec search_item%rowtype;
	ts_offset timestamp;
	"start" integer;
	cam_id_list uuid_set%rowtype;
begin
	-- get camera id list
	select R.r_camera_id  as cam_id into cam_id_list
	from task_info ti , camera_group_rel R
	where ti.task_id=tid and ti.cam_group_id=R.r_group_id;

	ts_offset := localtimestamp - cast( sec || ' seconds' as interval );
	"start" := ( "page" - 1) * "page_size";

	if sec = 0 then
		for v_rec in (
			select comp_id, cid,  ("base_cam_uri" || '/' || cid || '/' || url_match_image) cam_file, 
				("base_uri" || '/' || url_target_image) src_image, 
				("base_uri" || '/' || url_target_video) src_video, offset_in_video offset_video,
				similarity, capture_time ts
			from compare_result_store
			where cid in (cam_id_list.id)) limit "page_size" offset "start" loop
			return next v_rec;
		end loop;
	else
		for v_rec in (
			select comp_id, cid,  ("base_cam_uri" || '/' || cid || '/' || url_match_image) cam_file, 
				("base_uri" || '/' || url_target_image) src_image, 
				("base_uri" || '/' || url_target_video) src_video, offset_in_video offset_video,
				similarity, capture_time ts
			from compare_result_store
			where cid in (cam_id_list.id) and capture_time > ts_offset) limit "page_size" offset "start" loop
			return next v_rec;
		end loop;
	end if;

	return;
end
$$ language plpgsql;

-- test script for search result filter

-- select * from get_search_result_by_tid(
-- '3185179e-b406-419c-b8db-a82178ad743f','/store/search',
-- '/store/result', 100000, 1, 20);

-- return last 'sec' seconds search result with pager capability
create type search_track_item as (
	comp_id uuid, cid uuid, lng float, lat float,
	cam_file varchar, 
	src_image varchar, src_video varchar,
	ts timestamp);

-- filter search result
create or replace function get_search_track_result_by_tid(
	"tid" uuid, "base_uri" varchar, "base_cam_uri" varchar, sec integer, "page" integer, "page_size" integer
	) returns setof search_track_item as 
$$
-- tid:	task id (uuid)
-- base_uri: 	task resource file uri prefix for www access 
-- base_cam_uri:	compare file uri prefix
-- sec:	last 'sec' seconds data, 0 will return all of results
-- foxcafe@163.com
declare
	v_rec search_track_item%rowtype;
	ts_offset timestamp;
	"start" integer;
	cam_id_list uuid_set%rowtype;
begin
	-- get camera id list
	select R.r_camera_id  as cam_id into cam_id_list
	from task_info ti , camera_group_rel R
	where ti.task_id=tid and ti.cam_group_id=R.r_group_id;

	ts_offset := localtimestamp - cast( sec || ' seconds' as interval );
	"start" := ( "page" - 1) * "page_size";

	if sec=0 then
		for v_rec in (
			select comp_id, comp.cid, cam.c_longitude lng, cam.c_lat lat,
				("base_cam_uri" || '/' || comp.cid || '/' || url_match_image) cam_file, 
				("base_uri" || '/' || url_target_image) src_image, 
				("base_uri" || '/' || url_target_video) src_video,
				capture_time ts
			from compare_result_store comp left join camera_info cam on cam.cid=comp.cid
			where comp.cid in (cam_id_list.id))  limit "page_size" offset "start" loop
			return next v_rec;
		end loop;
	else
		for v_rec in (
			select comp_id, comp.cid, cam.c_longitude lng, cam.c_lat lat,
				("base_cam_uri" || '/' || comp.cid || '/' || url_match_image) cam_file, 
				("base_uri" || '/' || url_target_image) src_image, 
				("base_uri" || '/' || url_target_video) src_video,
				capture_time ts
			from compare_result_store comp left join camera_info cam on cam.cid=comp.cid
			where comp.cid in (cam_id_list.id) and capture_time > ts_offset)  limit "page_size" offset "start" loop
			return next v_rec;
		end loop;
	end if;

	return;
end
$$ language plpgsql;

-- select * from get_search_track_result_by_tid(
-- 	'598bfeb4-917c-4547-9455-f4c188998921', '/store/result',
-- 	'/nfsroot/controller', 106000
-- )

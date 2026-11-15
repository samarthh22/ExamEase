import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { openRepository,type Repository } from './db.js';
import { hashPassword } from './services/auth.js';
import type { Role } from '../shared/types.js';
export const DEMO_PASSWORD='ExamEase@2026';
export function seed(repo:Repository){
  if(repo.list('users').length)return false;
  return repo.transaction(()=>{
    const password_hash=hashPassword(DEMO_PASSWORD),now=new Date().toISOString(),department='Computer Science';
    const addUser=(id:string,email:string,name:string,role:Role,dept=department)=>repo.insert('users',{id,email,name,role,department:dept,password_hash,active:1,created_at:now});
    addUser('u-admin','admin@examease.local','Examination Office','EXAM_ADMIN');addUser('u-system','system@examease.local','System Administrator','SYS_ADMIN');addUser('u-hod','hod@examease.local','Dr. Kavita Rao','HOD');
    addUser('u-faculty','faculty@examease.local','Dr. Ananya Sharma','FACULTY');addUser('u-faculty-2','faculty2@examease.local','Dr. Rohan Mehta','FACULTY');
    repo.insert('faculty',{id:'f-1',user_id:'u-faculty',department});repo.insert('faculty',{id:'f-2',user_id:'u-faculty-2',department});
    const names=['Aarav Sharma','Diya Patel','Ishaan Verma','Meera Singh','Riya Kapoor','Vihaan Gupta'];
    names.forEach((name,i)=>{addUser(`u-student-${i+1}`,i===0?'student@examease.local':`student${i+1}@examease.local`,name,'STUDENT');repo.insert('students',{id:`s-${i+1}`,user_id:`u-student-${i+1}`,roll_no:`24UCC${101+i}`,batch_year:2024,department});});
    const courseData=[['c-1','CS314','Software Engineering','f-1'],['c-2','CS301','Database Management Systems','f-1'],['c-3','CS303','Operating Systems','f-2'],['c-4','CS305','Computer Networks','f-2']];
    for(const [id,code,title,faculty_id] of courseData){repo.insert('courses',{id,code,title,faculty_id,credits:4,department,semester:'2026 · Semester V',active:1});for(let i=1;i<=6;i++)repo.insert('enrollments',{id:randomUUID(),student_id:`s-${i}`,course_id:id});}
    const day=(offset:number)=>{const date=new Date();date.setUTCDate(date.getUTCDate()+offset);return date.toISOString().slice(0,10);};
    for(let i=0;i<4;i++)repo.insert('exams',{id:`e-${i+1}`,course_id:`c-${i+1}`,exam_type:'End semester',date:day(7+i*2),start_time:'09:00',end_time:'12:00',venue:i%2?'Lecture Hall 2':'Lecture Hall 1',max_marks:100,status:'PUBLISHED',results_published:0});
    repo.insert('exams',{id:'e-past',course_id:'c-1',exam_type:'Mid semester',date:day(-14),start_time:'09:00',end_time:'11:00',venue:'Lecture Hall 1',max_marks:100,status:'PUBLISHED',results_published:0});
    for(let i=1;i<=6;i++){
      repo.insert('registrations',{id:`r-past-${i}`,student_id:`s-${i}`,exam_id:'e-past',status:'REGISTERED',seat:i,created_at:now});
      repo.insert('marks',{id:randomUUID(),student_id:`s-${i}`,exam_id:'e-past',marks_obtained:[88,76,92,61,45,34][i-1],absent:0,remarks:'',updated_at:now});
    }
    repo.insert('registrations',{id:'r-upcoming',student_id:'s-1',exam_id:'e-2',status:'REGISTERED',seat:1,created_at:now});
    return true;
  });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const repo=openRepository();console.log(seed(repo)?'Demo data created. See README for local accounts.':'Existing data retained; seed skipped.');repo.close();}

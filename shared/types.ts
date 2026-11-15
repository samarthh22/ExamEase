export type Role='STUDENT'|'FACULTY'|'EXAM_ADMIN'|'HOD'|'SYS_ADMIN';
export interface User { id:string; email:string; name:string; role:Role; department:string; active:number; created_at:string; password_hash?:string }
export interface Student {id:string;user_id:string;roll_no:string;batch_year:number;department:string;name?:string;email?:string}
export interface Faculty {id:string;user_id:string;department:string;name?:string;email?:string}
export interface Course {id:string;code:string;title:string;credits:number;department:string;semester:string;faculty_id:string|null;active:number;faculty_name?:string}
export interface Exam {id:string;course_id:string;exam_type:string;date:string;start_time:string;end_time:string;venue:string;max_marks:number;status:'DRAFT'|'PUBLISHED'|'CANCELLED';results_published:number;code?:string;title?:string;department?:string;faculty_id?:string;registered_count?:number;marked_count?:number;result_count?:number;registration_id?:string;registration_status?:string}
export interface Boundary {id?:string;grade_label:string;lower_bound:number;upper_bound:number}
export interface Statistics {count:number;mean:number|null;median:number|null;highest:number|null;lowest:number|null;std_dev:number|null}
export interface RosterRow {student_id:string;name:string;roll_no:string;marks_obtained:number|null;absent:number;remarks:string;grade:string|null;result_status:string|null}
export interface Registration {id:string;student_id:string;exam_id:string;status:string;seat:number;created_at:string;name?:string;roll_no?:string;code:string;title:string;exam_type:string;date:string;start_time:string;end_time:string;venue:string;exam_status:string}
export interface ResultRow {id:string;student_id:string;exam_id:string;marks_obtained:number|null;grade:string|null;status:string|null;published_at:string|null;code:string;title:string;exam_type:string;max_marks:number;name?:string;roll_no?:string;date:string}
export interface CourseReport {exam:Exam;statistics:Statistics;distribution:{grade:string;count:number}[];registered:number;pending:number;passed:number;failed:number;passRate:number|null}

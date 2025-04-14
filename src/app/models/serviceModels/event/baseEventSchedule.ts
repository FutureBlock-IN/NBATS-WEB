export interface PostEventScheduleConfigDTO{
    eventId:number;
    startTime:string;
    endTime:string;
    duration:number;
    recurring:boolean;
    repeat:string;
    weekDays:string;
}
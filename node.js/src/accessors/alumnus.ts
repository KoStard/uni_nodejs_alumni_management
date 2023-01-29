export interface Alumnus {
    id: number;
    fullName: string;
    currentEmployer: string | undefined; // They might not have a job currently
    previousEmployers: Array<string>;
    // We might want to have multiple study periods, but for now we'll just have one
    studyStartDate: Date;
    studyEndDate: Date;
    description: string;
}
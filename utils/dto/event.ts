export type Event = {
    id: bigint;
    user_id: string;
    uid: string;
    title: string;
    description?: string;
    location?: string;
    status: EventStatus;
    time_start: Date;
    time_end: Date;
    timezone?: string;
    rrule_string?: string;
    sequence: number;
    created_at: Date;
    updated_at: Date;
    recurrence_id?: Date;
    original_event_id?: bigint;
}


enum EventStatus {
    "CONFIRMED",
     "TENTATIVE",
     "CANCELLED"
}
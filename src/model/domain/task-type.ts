export enum TaskType {
    /**
     * SINGLE has no schedule
     */
    SINGLE = 'single',

    /**
     * DAILY has no schedule
     */
    DAILY = 'daily',
    /**
     * WEEKLY has the following options:
     * - interval (as in every x weeks)
     * - days of the week (multiple options possible)
     */
    WEEKLY = 'weekly',

    /**
     * MONTHLY has the following options:
     * - interval (as in every x months)
     * - days of month (what specific days)
     */
    MONTHLY = 'monthly',

    /**
     * YEARLY has the following options:
     * - interval (as in every x years)
     * - Month
     */
    YEARLY = 'yearly',
    FLEXIBLE = 'flexible'
}
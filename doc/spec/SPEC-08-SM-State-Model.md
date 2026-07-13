
#   SPECIFICATION: STATE MODEL (SPEC-SM)

✳   Created:  **2026-06-18 10:18**
✎   Modified: **2026-06-18 10:18**

##  LIFECYCLE: Event <a id="SPEC-SM-event"></a>

-   Entity:  SPEC-DM-event
-   Initial: Planning
-   Final:   Finished

### STATES

-   `Planning`:
    The event is created and configured but not visible to attendees.

-   `Published`:
    The event is visible to attendees but not yet started.

-   `Running`:
    The event is live and attendees can attend and interact.

-   `Finished`:
    The event has ended, access is closed, and data is anonymized.

### TRANSITIONS

-   `Planning` ─(publish)─► `Published`:
    The event becomes visible to invited attendees,
    **WHEN** the manager publishes the configured event.

-   `Published` ─(start)─► `Running`:
    The live stream and interaction channels open for attendees,
    **WHEN** the manager starts the event.

-   `Planning` ─(start)─► `Running`:
    The event goes live directly from planning,
    **WHEN** the manager starts an unpublished event.

-   `Running` ─(finish)─► `Finished`:
    The anonymization procedure runs and access is closed,
    **WHEN** the manager finishes the event.

##  LIFECYCLE: Message <a id="SPEC-SM-message"></a>

-   Entity:  SPEC-DM-message
-   Initial: Pending
-   Final:   Rejected, Answered, Suspended, Accepted

### STATES

-   `Pending`:
    The attendee has submitted the message and it awaits moderation.

-   `Accepted`:
    The message is approved and visible to the audience if configured.

-   `Rejected`:
    The message is declined and will be deleted entirely on event finish.

-   `Forwarded`:
    The accepted message is handed to the presenter as a work item.

-   `Answered`:
    The presenter has processed and answered the message in the live event.

-   `Suspended`:
    The presenter will not process the message in the live event.

### TRANSITIONS

-   `Pending` ─(accept)─► `Accepted`:
    The message becomes visible to the audience,
    **WHEN** a moderator approves it or sentiment auto-accept applies.

-   `Pending` ─(reject)─► `Rejected`:
    The message is hidden and marked for deletion,
    **WHEN** a moderator declines it or sentiment auto-reject applies.

-   `Accepted` ─(forward)─► `Forwarded`:
    The message enters the presenter's work basket and becomes immutable,
    **WHEN** a moderator forwards it to the presenter.

-   `Forwarded` ─(answer)─► `Answered`:
    The answered timestamp is recorded,
    **WHEN** the presenter or moderator marked the message as answered on stage.

-   `Forwarded` ─(suspend)─► `Suspended`:
    The message is set aside for the live event,
    **WHEN** the presenter or moderator decided not to process it.

##  LIFECYCLE: AuthorizationToken <a id="SPEC-SM-authtoken"></a>

-   Entity:  SPEC-DM-authtoken
-   Initial: Issued
-   Final:   Used

### STATES

-   `Issued`:
    The token has been generated, typically at event creation.

-   `Sent`:
    The token has been delivered to the user by email.

-   `Used`:
    The token has been consumed in a login attempt.

### TRANSITIONS

-   `Issued` ─(send)─► `Sent`:
    The token is emailed to the user,
    **WHEN** the user requests a login challenge.

-   `Sent` ─(consume)─► `Used`:
    The token is marked spent,
    **WHEN** the user submits it in a successful or unsuccessful login attempt.

-   `Issued` ─(consume)─► `Used`:
    The pre-generated token is marked spent,
    **WHEN** an automatic-access URL carrying the token is used.

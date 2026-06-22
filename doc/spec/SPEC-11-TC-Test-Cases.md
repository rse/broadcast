
#   SPECIFICATION: TEST CASES (SPEC-TC)

✳   Created:  **2026-06-18 10:18**
✎   Modified: **2026-06-18 10:18**

##  TEST CASE: Valid Token Grants Access <a id="SPEC-TC-valid-token"></a>

-   Verifies:       SPEC-FR-authentication
-   Pre-Condition:  An invited user with a sent, unexpired authorization token exists for a running event.
-   Input:          The user submits the correct six-digit token for their email.
-   Expected:       The system issues a session token and grants access to the stream.
-   Post-Condition: The authorization token is in state used.

##  TEST CASE: Unauthorized Email Rejected <a id="SPEC-TC-unauthorized"></a>

-   Verifies:       SPEC-FR-authentication
-   Pre-Condition:  An email not on the access list and not matching the access pattern.
-   Input:          The user enters that email in the login dialog.
-   Expected:       The system denies access and shows a not-authorized notice.

##  TEST CASE: Second Login Closes First Session <a id="SPEC-TC-single-session"></a>

-   Verifies:       SPEC-FR-parallel-access
-   Pre-Condition:  A user holds an active session for an event from one device.
-   Input:          The same user completes a login from a second device.
-   Expected:       The first connection is closed and only the new session remains active.
-   Post-Condition: Exactly one active session token exists for the user and event.

##  TEST CASE: Moderated Question Starts Pending <a id="SPEC-TC-moderated-pending"></a>

-   Verifies:       SPEC-FR-moderation
-   Pre-Condition:  An event with question moderation enabled is running.
-   Input:          An attendee submits a question.
-   Expected:       The question is stored in state pending and is not visible to the audience.

##  TEST CASE: Unmoderated Chat Starts Accepted <a id="SPEC-TC-unmoderated-accepted"></a>

-   Verifies:       SPEC-FR-moderation
-   Pre-Condition:  An event with chat moderation disabled is running.
-   Input:          An attendee submits a chat message.
-   Expected:       The message is stored in state accepted and is immediately visible.

##  TEST CASE: Forwarded Message Is Locked <a id="SPEC-TC-forward-lock"></a>

-   Verifies:       SPEC-FR-message-editing
-   Pre-Condition:  An accepted question has been forwarded to the presenter.
-   Input:          The original attendee attempts to edit or delete the message.
-   Expected:       The system refuses the edit and the message remains unchanged.

##  TEST CASE: Sentiment Auto-Reject Below Threshold <a id="SPEC-TC-sentiment-reject"></a>

-   Verifies:       SPEC-FR-server-sentiment
-   Pre-Condition:  Server-side sentiment analysis and auto-reject are enabled.
-   Input:          An attendee submits a message scoring -0.5.
-   Expected:       The system stores the message directly in state rejected.

##  TEST CASE: Live Provider Switch Propagates <a id="SPEC-TC-provider-switch"></a>

-   Verifies:       SPEC-FR-provider-switch
-   Pre-Condition:  A running event with two configured resources and connected clients.
-   Input:          The manager activates the second resource on the channel.
-   Expected:       All connected clients switch to the new stream without user interaction.
-   Post-Condition: Exactly one resource of the channel is active.

##  TEST CASE: Config Change Reaches Clients <a id="SPEC-TC-config-propagation"></a>

-   Verifies:       SPEC-FR-config-propagation
-   Pre-Condition:  A running event with connected clients and chat disabled.
-   Input:          The manager enables chat for the event.
-   Expected:       Connected clients show the chat panel within 2 seconds without a reload.

##  TEST CASE: Ventari Import Avoids Duplicates <a id="SPEC-TC-ventari-dedup"></a>

-   Verifies:       SPEC-FR-ventari-import
-   Pre-Condition:  An event whose access list already contains some imported emails.
-   Input:          The manager imports a Ventari sheet overlapping the existing emails.
-   Expected:       Existing users are not duplicated and their prior tokens are returned.

##  TEST CASE: Returned URL Format <a id="SPEC-TC-url-format"></a>

-   Verifies:       SPEC-FR-ventari-export
-   Pre-Condition:  A Ventari import has generated tokens for new users.
-   Input:          The manager exports the access URLs.
-   Expected:       Each URL contains event, user, and a six-digit "NNN-NNN" token in the URL column.

##  TEST CASE: Anonymization Removes Personal Data <a id="SPEC-TC-anonymize"></a>

-   Verifies:       SPEC-FR-user-consent
-   Pre-Condition:  A running event with messages, likes, tokens, and an access list.
-   Input:          The manager finishes the event.
-   Expected:       Sender names become "Anonymous", likes become bare counts, and tokens, users, and Moderator roles are deleted.
-   Post-Condition: No personal attendee data remains and Manager roles are retained.

##  TEST CASE: Export Contains Required Fields <a id="SPEC-TC-export-fields"></a>

-   Verifies:       SPEC-FR-export-inputs
-   Pre-Condition:  A finished, anonymized event with messages.
-   Input:          The manager exports the attendee inputs.
-   Expected:       The export includes at least timestamp, state, number of likes, and message text per message.

##  TEST CASE: Concurrent Attendee Load <a id="SPEC-TC-load"></a>

-   Verifies:       SPEC-NR-attendee-scale
-   Pre-Condition:  A running event deployed with scaled proxy, relay, and server instances.
-   Input:          10000 simulated attendees connect simultaneously and interact.
-   Expected:       All connections are served and message round-trips remain responsive under load.

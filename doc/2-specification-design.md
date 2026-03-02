
Specification
=============

Privacy by design - Data Protection
-----------------------------------

msg.Broadcast is designed to keep personal data only for the moment it is necessary.
As documented in the Role Management only the "Administrators (Hardware)" and the "Administrator (Software)" are set permanently in the system.
Both roles are not creating data directly mapped to their user in the software system. \
The "Administrators (Hardware)" might leave a footprint on the physical hardware by their command line interaction. \
The "Administrators (Software)" are responsible for creating and deleting events in the system. Newly created events will get a first "Manager" that can edit the event further.

Beside the two roles above the system does not manage user accounts at all. Users are only present when either granted a _Role_, invited to an event (see attribute _accessList_ in entity _Event_) or when joining an event via matching allowed pattern match (see attribute _accessEmailPattern_ in entity _Event_).

The entities _AuthorizationToken_ and _SessionToken_ are helpers to let users log into an event and keep them in an event (both for management and joining). \
A user can only have one active event session at a time. In case of a rejoin of the user the current _SessionToken_ can be reused as long as the event is running. \
If the user joins the same event from another browser or another device then he has to pass the _AuthorizationToken_ challenge again and he will lose his current connection to the event.

On event finish the system will automatically anonymize the data of an event in the following manner:
- _Messages_ will be updated with a bare number of likes (attribute _likes_)
- _Messages_ of type ___Chat___ and ___Question___ will have the _senderName_ updated to "Anonymous"
- _Messages_ will loose the _liker_ and _sender_ relation
- _AuthorizationToken_ will be deleted
- _SessionToken_ will be deleted
- The events _accessList_ will be cleared and all referenced _Users_ will be deleted
- _Roles_ of type ___Moderator___ will be deleted; _Roles_ of type ___Manager___ will remain until the event gets deleted entirely since Managers should still be able to export the anonymous event data.


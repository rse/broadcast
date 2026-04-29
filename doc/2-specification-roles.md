
Specification
=============

Role Management
---------------

msg.Broadcast is role based. Rights are granted by roles.
The following table shows the current roles and their corresponding rights:

| role                     | area                   | description and rights                                                                                                                                                                                                                                                                                                                                                          |
|--------------------------|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Administrator (Hardware) | development            | The hardware administrator has access to the physical server. He can grant access to that server.                                                                                                                                                                                                                                                                               |
| Administrator (Software) | software configuration | The software administrator has access to the Gitea administration area. He can create new repositories. He can also grant developers access to existing repositories. He is also able to create events.                                                                                                                                                                         |
| Manager                  | software               | An event "Manager" can edit, start, stop, delete events. They can also export anonymous event data of the event.                                                                                                                                                                                                                                                                |
| Moderator                | software               | An event "Moderator" is event specific. He will be able to moderate chat and question messages during an event. Moderation means accepting or rejecting messages and forwarding accepted messages to a "Presenter"                                                                                                                                                              |
| Presenter                | software               | An event "Presenter" is a physical moderator in a recorded video event. He will get forwarded messages from the "Moderator" in order to process them directly on stage in the live event. He marks a processed message after it was presented. |
| Attendee                 | software               | An event "Attendee" is everyone that got invited and logged in for a specific event. He managed the two factor authentication and holds an active session for the specific event.                                                                                                                                                                                                |


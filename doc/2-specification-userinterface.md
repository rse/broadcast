
Specification
=============

User Interface
--------------

### (Screen) Panel

User: All, Device: All

- (Dialog) Header Bar
    - (Fragment) Profile (Firstname, Lastname, Email, Roles) (+ Stored Data, GDPR)
    - (Fragment) Switch to different

### (Screen) Attendee

User: Event Attendee (MA), Device: Desktop (16:9), Mobile (Landscape), Mobile (Portrait)

- (Dialog) Login
    - (Fragment) Email Validation
- (Dialog) About & GDPR-Check
- (Dialog) Main
    - (Fragment) Video Stream (left top)
    - (Fragment) Sidebar (right)
        - (Fragment) Questions (Likes)
            - (Info) Tags, Message, Autor (Firstname, Lastname, Email), Timestamp, State (Submitted, Edited, Approved, Answered)
            - (Info) Edit, Profanity-Info, Original-Language
        - (Fragment) Chat (Original/Reply) (Likes)
            - (Info) Tags, Message, Autor (Firstname, Lastname, Email), Timestamp, State (Submitted, Edited, Approved)
            - (Info) Edit, Profanity-Info, Original-Language
        - (Fragment) Votes & Emotions (HUDS Pad: EXTERNAL)

### (Screen) Studio

User: Event Speaker (V), Device: Desktop (16:9, plakativ/grob 2-4m)

- (Dialog) Statistic Dashboard
    - (Info) X-axis: time, Y-axis: number of users
    - (Info) pie-chart: percentage of tracks
- (Dialog) Questions (Kachelansicht, non-interactive)
    - (Info) done, prio

## (Screen) Host

User: Event Host (ZM), Device: Desktop/Tablet (16:9)

- (Dialog) Questions (Kachelansicht, interactive)
    - (Info) done, prio

## (Screen) Moderator

User: Event Backoffice (ZM), Device: Desktop (16:9)

- (Fragment) Filter for states
- (Fragment) Questions: 10-30
    - (Info) reject/approve/approve+forward/answered (Kanban-Board Lane oben)
- (Fragment) Chat (zeitkritisch): 10-XXX
    - (Info) reject/approve/approve+forward          (Kanban-Board Lane unten)

## (Screen) Manager

User: Event Manager (XT/ZM)

- (Dialog) Statistics/Trends
- (Dialog) Event Config
    - (Fragment) config
    - (Fragment) enable/disable
    - (Fragment) delete

## (Screen) Administrator

User: System Manager (XT) Device: Desktop (16:9)

- (none) role assignment of users) &rarr; config file
- (none) streaming provider configuration) &rarr; config file

## XXX

[-] [x] Channel: [DE] [+]
    [-] Resource: ( ) [Provider1] StreamId: [1 ] Foo: [   ]
    [-] Resource: (*) [Provider2] SID:      [2 ] Bar: [   ] Quux: [   ]
[-] [x] Channel: [DE+UT]
    [-] Resource: (*) [Provider1] StreamId: [1 ] Foo: [   ]
[-] [ ] Channel: [EN]
    [-] Resource: (*) [Provider1] StreamId: [1 ] Foo: [   ]
    [-] Resource: ( ) [Provider2] SID:      [2 ] Bar: [   ] Quux: [   ]
[-] [ ] Channel: [EN+UT]
    [-] Resource: (*) [Provider1] StreamId: [1 ] Foo: [   ]
[-] [ ] Channel: [Program]
    [-] Resource: (*) [Provider3] Url: [ http://www.flyer.com/ ]



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

## (Screen) Moderator       (Event  Backoffice,  ZM) -> Desktop (16:9)
  - Fragment: Filter for states
  - Questions: 10-30
    - reject/approve/approve+forward/answered * (Kanban-Board Lane oben)
  - Chat (zeitkritisch): 10-XXX
    - reject/approve/approve+forward          * (Kanban-Board Lane unten)

## (Screen) Manager         (Event  Manager,    XT/ZM)
  - Statistics/Trends
  - Event Config
    - config (see Event-Configuration.txt).  *
    - enable/disable
    - delete

## (Screen) [Administrator] (System Manager,    XT)
  - (none)
  - (role assignment of users) -> config file
  - (streaming provider configuration) -> config file


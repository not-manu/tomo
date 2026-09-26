# Problem keywords and case studies

Each keyword names a kind of team friction. The case is the famous, expensive version of it; the "everyday version" is the one the judges have lived through.

Framing rule: don't claim tomo would have prevented these disasters. Say *"this is the billion-dollar version of something every small team hits weekly,"* then let the demo fix the small version.

## 1. Context loss at handoff: Atlassian, 2022

One team asked another to delete an old app and handed over the IDs of whole customer sites instead. Atlassian's review: *"there was a communication gap between the team that requested the deletion and the team that ran it."* 883 sites (775 customers) were deleted in 23 minutes, and some were down for up to 14 days.

- **Everyday version:** "I thought you meant the *other* file."
- [Atlassian post-incident review](https://www.atlassian.com/blog/atlassian-engineering/post-incident-review-april-2022-outage)

## 2. Version drift / tool fragmentation: Airbus A380, 2006

The German and Spanish teams designed in CATIA 4, the French and British teams in CATIA 5. The wiring calculations didn't match, so harnesses came out too short. About 100,000 wires and 40,000 connectors had to be redesigned, and at one point 1,100+ German engineers were camped out in Toulouse fixing it. The delay cost billions.

- **Everyday version:** "Which Figma / spec / branch is current?" This is the hardware engineering example.
- [Simple Flying](https://simpleflying.com/airbus-a380-program-software-discrepancies-delay-story/), [WorldCAD Access](https://worldcadaccess.typepad.com/blog/2006/09/a380_delayed_by.html)

## 3. Environment drift ("works on my machine"): Knight Capital, 2012

A technician copied new code to 7 of 8 servers. The eighth still had old code, which woke up when the market opened. $460M lost in 45 minutes.

- **Everyday version:** "It works on my laptop," "which Python are you on?"
- [SEC order (PDF)](https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf)

## 4. Knowledge silos / interface mismatch: Mars Climate Orbiter, 1999

Lockheed's software output pound-force seconds; JPL's navigation expected newton-seconds. The error went uncaught for the whole nine-and-a-half-month cruise, and the $327.6M spacecraft was lost. The investigation board also cited *"inconsistent communications and training within the project."*

- **Everyday version:** frontend and backend each assuming the other one handles something.
- [Wikipedia](https://en.wikipedia.org/wiki/Mars_Climate_Orbiter), [NASA lessons learned (PDF)](https://llis.nasa.gov/llis_lib/pdf/1009464main1_0641-mr.pdf)

## 5. Invisible state / wrong context: GitLab, 2017

An engineer meant to wipe the replica (`db2`) and ran the command on the primary (`db1`). Most backups then turned out not to work. 6 hours of data were lost and recovery took 18 hours.

- **Everyday version:** "Wait, whose terminal is this / which environment am I in?"
- [GitLab postmortem](https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/)

## 6. Ramp-up tax / onboarding gap: Brooks's law + Gallup

"Adding manpower to a late software project makes it later": new people need time to ramp up, and each extra person adds communication overhead. Gallup found only 12% of employees strongly agree their organization onboards new people well.

- **Everyday version:** the new hire burning their first week asking where things are (see angle #1 in `angles.md`).
- [Brooks's law](https://en.wikipedia.org/wiki/Brooks%27s_law), [Gallup](https://www.gallup.com/workplace/235121/why-onboarding-experience-key-retention.aspx)

## Which to use

One case per slide at most. **Airbus** is the clearest picture of copies drifting and covers hardware. **Atlassian** is recent, a SaaS team, and its root cause is literally "communication gap."

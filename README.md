# Zentone

## Overview

## Scope

### To Do
- [ ] Front End
  - [x] Slide viewport parsing
  - [x] Audio SQL uploading
  - [x] Fluid redirection
  - [ ] Rewrite Nav to Flex
  - [ ] User Bar Partial
  - [ ] PDF Editor Controls
  - [ ] Dropzone styles
  - [ ] Thumbs border moves with next/prev buttons

- [ ] Back End
  - [ ] Pdf size attached to upload
  - [x] Check file before aliyun upload
  - [ ] User data collection
  - [ ] Post data collection
  - [x] User Local Authentication Route

- [ ] Security & Authentication
  - [ ] User OAuth strategies
  - [ ] User cookies and site tokens
  - [ ] CORS protection
  - [x] Database password encryption

- [ ] Production & Hosting
  - [ ] Prepare code for production environment 
  - [ ] Migrate site to custom domain
  - [ ] Give keys and access to owner

### Process
- [x] Attach aliyun links to presentations & audio
- [X] Retrieve from pdf.js
- [x] Display pdf in window
- [x] Break pdf into slide array
- [x] Fetch Audio relating to presentation
- [x] Display audio in select box
- [x] Relate Audio to Slides
- [x] Regenerate req.session to upload multiple presentations
- [x] Thumbnail control pageNum
- [x] Send pageNum to dropzone upload
- [x] POST blog entry
- [x] UPDATE audioArr
- [ ] Retrieve pdf to home
- [ ] Create audio player


### Bugs
- [x] Signup successful, but doesn't redirect
- [x] Fetch doesn't assign res.user
- [x] Wrapping two table entries in Promise.all sets multiple res.header
- [x] Body width overflow
- [x] POST /api/audio return pageNum
- [ ] Delayed & stacking message flashing

### Optimize && Refactor
- [ ] Organize css into scss pages
- [ ] Remove unnecessary scripts
- [ ] Migrate from jQuery to vanilla js
- [ ] Lazy load thumbnail slider

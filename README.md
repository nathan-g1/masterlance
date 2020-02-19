<details>
  <summary>How to collaborate to this project?</summary>
  
  # Developers&#39; Guide
  ## Overview

This document is intended to acquaint developers with the conventions and standards used in the **MasterLance** platform. New and existing developers should be intimately familiar with and regularly visit this document.

This is a living document, convention and standards are continuously growing and evolving with this document being updated accordingly. Major system redesigns or designs requiring some sort of convention to be followed should be documented here and be part of the pull/merge request applying the code change.

Whenever changes to this document is made the person making the change should take the responsibility to make sure that other developers are aware of the changes. One way of doing this is to mention all the developers in the team on the description section of the pull request making the change. This ensures that every developer receives an email about the update and can easily see exactly what got updated.

## Git Conventions

**Branching**

Naming format:&lt;Branch Type&gt;&lt;GitLab issue number&gt;-&lt;Issue-summary&gt;

Branch Type:

- feature – feature development. Branched off of develop
- bugfix – fixes for bugs found in development. Branched off of develop
- hotfix – fixes for bugs found in production. Branched off of master

Example: bugfix/#8-unable-to-logout

**Note** : All branches should be closed when the reason of the branch creation is resolved. (upon being merged to develop or master branch)

**Commits**

- All commits should be atomic meaning each commit should only make changes that can&#39;t be stably broken down into different commits. If a commit is reverted the resulting change should always be stable with only an isolated change undone.
- All commits should include the git lab issue number that the change relates to in the comment
- Commit message should be written in a way that the first line is a brief summary of what the commit does followed by an empty new line and then a description with the specifics answering **why** it is done that way.
- Commits should be small and done regularly.
- Pushing commits directly to the develop or master branch is strictly prohibited (**it is not just cool man**). Changes to these branches should only be incorporated through pull-requests.

**Pull/Merge Requests**

- Team leads for the various components (UI, DB, API, OPS) affected by the change set of the pull-request should be added as reviewers.
- If the change set includes major modification to a code written by another developer then that developer should also be added as a reviewer.
- Gitlab&#39;s issue number should be mentioned in the title of the pull-request.
- All communications about the pull-request between the developer and reviewers should be commented on the pull-request. These comments could later serve as documentation for other developers working on similar features or bugfixes.
- If reviewers find areas for improvement, they should mention why the current implementation is inadequate and propose a better approach.

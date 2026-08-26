/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/** Detailed status information about a pull request merge. */
export type MergeStateStatus =
  /** The head ref is out of date. */
  | 'BEHIND'
  /** The merge is blocked. */
  | 'BLOCKED'
  /** Mergeable and passing commit status. */
  | 'CLEAN'
  /** The merge commit cannot be cleanly created. */
  | 'DIRTY'
  /** The merge is blocked due to the pull request being a draft. */
  | 'DRAFT'
  /** Mergeable with passing commit status and pre-receive hooks. */
  | 'HAS_HOOKS'
  /** The state cannot currently be determined. */
  | 'UNKNOWN'
  /** Mergeable with non-passing commit status. */
  | 'UNSTABLE';

/** Whether or not a PullRequest can be merged. */
export type MergeableState =
  /** The pull request cannot be merged due to merge conflicts. */
  | 'CONFLICTING'
  /** The pull request can be merged. */
  | 'MERGEABLE'
  /** The mergeability of the pull request is still being calculated. */
  | 'UNKNOWN';

/** The review status of a pull request. */
export type PullRequestReviewDecision =
  /** The pull request has received an approving review. */
  | 'APPROVED'
  /** Changes have been requested on the pull request. */
  | 'CHANGES_REQUESTED'
  /** A review is required before the pull request can be merged. */
  | 'REVIEW_REQUIRED';

/** Emojis that can be attached to Issues, Pull Requests and Comments. */
export type ReactionContent =
  /** Represents the `:confused:` emoji. */
  | 'CONFUSED'
  /** Represents the `:eyes:` emoji. */
  | 'EYES'
  /** Represents the `:heart:` emoji. */
  | 'HEART'
  /** Represents the `:hooray:` emoji. */
  | 'HOORAY'
  /** Represents the `:laugh:` emoji. */
  | 'LAUGH'
  /** Represents the `:rocket:` emoji. */
  | 'ROCKET'
  /** Represents the `:-1:` emoji. */
  | 'THUMBS_DOWN'
  /** Represents the `:+1:` emoji. */
  | 'THUMBS_UP';

/** The possible commit status states. */
export type StatusState =
  /** Status is errored. */
  | 'ERROR'
  /** Status is expected. */
  | 'EXPECTED'
  /** Status is failing. */
  | 'FAILURE'
  /** Status is pending. */
  | 'PENDING'
  /** Status is successful. */
  | 'SUCCESS';

export type DashboardQueryVariables = Exact<{
  reviewRequestsCursor?: string | null | undefined;
  assignedIssuesCursor?: string | null | undefined;
  ownedPullRequestsCursor?: string | null | undefined;
  ownedIssuesCursor?: string | null | undefined;
  contributedPullRequestsCursor?: string | null | undefined;
  contributedIssuesCursor?: string | null | undefined;
  mentionedCursor?: string | null | undefined;
  authoredPullRequestsCursor?: string | null | undefined;
  participatingCursor?: string | null | undefined;
  changesRequestedCursor?: string | null | undefined;
  failingChecksCursor?: string | null | undefined;
  incomingPullRequestsCursor?: string | null | undefined;
}>;


export type DashboardQuery = { rateLimit: { cost: number, nodeCount: number, remaining: number, resetAt: string } | null, viewer: { login: string, name: string | null, avatarUrl: string }, reviewRequests: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, assignedIssues: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'Issue', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, assignedEvents: { nodes: Array<
            | { createdAt: string, assignee:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, ownedPullRequests: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, ownedIssues: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'Issue', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, assignedEvents: { nodes: Array<
            | { createdAt: string, assignee:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, contributedPullRequests: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, contributedIssues: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'Issue', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, assignedEvents: { nodes: Array<
            | { createdAt: string, assignee:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, mentioned: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'Issue', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, assignedEvents: { nodes: Array<
            | { createdAt: string, assignee:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, authoredPullRequests: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, changesRequested: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, failingChecks: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, participating: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'Issue', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, assignedEvents: { nodes: Array<
            | { createdAt: string, assignee:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, incomingPullRequests: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null } };

export type DashboardAttentionQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardAttentionQuery = { rateLimit: { cost: number, nodeCount: number, remaining: number, resetAt: string } | null, viewer: { login: string, name: string | null, avatarUrl: string }, reviewRequests: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, assignedIssues: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'Issue', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, assignedEvents: { nodes: Array<
            | { createdAt: string, assignee:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, mentioned: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'Issue', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, assignedEvents: { nodes: Array<
            | { createdAt: string, assignee:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, authoredPullRequests: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, changesRequested: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, failingChecks: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, participating: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'Issue', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, assignedEvents: { nodes: Array<
            | { createdAt: string, assignee:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, incomingPullRequests: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null } };

export type DashboardOwnedQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardOwnedQuery = { rateLimit: { cost: number, nodeCount: number, remaining: number, resetAt: string } | null, viewer: { login: string }, ownedPullRequests: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, ownedIssues: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'Issue', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, assignedEvents: { nodes: Array<
            | { createdAt: string, assignee:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null } };

export type DashboardContributionsQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardContributionsQuery = { rateLimit: { cost: number, nodeCount: number, remaining: number, resetAt: string } | null, viewer: { login: string }, contributedPullRequests: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null }, contributedIssues: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'Issue', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, assignedEvents: { nodes: Array<
            | { createdAt: string, assignee:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null } };

export type SearchPullRequestFragment = { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
    | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
       | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
           | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
           | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
           | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
          | { createdAt: string, requestedReviewer:
              | { login: string }
              | Record<PropertyKey, never>
             | null }
          | Record<PropertyKey, never>
         | null> | null } }
    | Record<PropertyKey, never>
   | null> | null };

export type SearchIssueFragment = { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
    | { __typename: 'Issue', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, author:
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
       | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
           | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, assignedEvents: { nodes: Array<
          | { createdAt: string, assignee:
              | { login: string }
              | Record<PropertyKey, never>
             | null }
          | Record<PropertyKey, never>
         | null> | null } }
    | Record<PropertyKey, never>
   | null> | null };

export type SearchCardFragment = { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
    | { __typename: 'Issue', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, author:
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
       | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
           | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, assignedEvents: { nodes: Array<
          | { createdAt: string, assignee:
              | { login: string }
              | Record<PropertyKey, never>
             | null }
          | Record<PropertyKey, never>
         | null> | null } }
    | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
       | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
           | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
           | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
           | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
          | { createdAt: string, requestedReviewer:
              | { login: string }
              | Record<PropertyKey, never>
             | null }
          | Record<PropertyKey, never>
         | null> | null } }
    | Record<PropertyKey, never>
   | null> | null };

export type DashboardSectionPageQueryVariables = Exact<{
  query: string;
  cursor?: string | null | undefined;
}>;


export type DashboardSectionPageQuery = { rateLimit: { cost: number, nodeCount: number, remaining: number, resetAt: string } | null, viewer: { login: string }, page: { issueCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, nodes: Array<
      | { __typename: 'Issue', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, assignedEvents: { nodes: Array<
            | { createdAt: string, assignee:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
          | { login: string }
         | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
              | { login: string }
             | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
            | { createdAt: string, requestedReviewer:
                | { login: string }
                | Record<PropertyKey, never>
               | null }
            | Record<PropertyKey, never>
           | null> | null } }
      | Record<PropertyKey, never>
     | null> | null } };

export type PullRequestCardFragment = { __typename: 'PullRequest', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, isDraft: boolean, mergeable: MergeableState, mergeStateStatus: MergeStateStatus, reviewDecision: PullRequestReviewDecision | null, author:
    | { login: string }
    | { login: string }
    | { login: string }
    | { login: string }
    | { login: string }
   | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
       | null } | null> | null }, reviews: { nodes: Array<{ createdAt: string, author:
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
       | null } | null> | null } | null, statusCheckRollup: { state: StatusState } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, changesRequestedReviews: { nodes: Array<{ createdAt: string, author:
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
       | null } | null> | null } | null, reviewRequestedEvents: { nodes: Array<
      | { createdAt: string, requestedReviewer:
          | { login: string }
          | Record<PropertyKey, never>
         | null }
      | Record<PropertyKey, never>
     | null> | null } };

export type IssueCardFragment = { __typename: 'Issue', id: string, number: number, title: string, url: string, createdAt: string, updatedAt: string, author:
    | { login: string }
    | { login: string }
    | { login: string }
    | { login: string }
    | { login: string }
   | null, repository: { nameWithOwner: string, url: string }, comments: { totalCount: number, nodes: Array<{ createdAt: string, author:
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
       | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactionGroups: Array<{ content: ReactionContent, viewerHasReacted: boolean, reactors: { totalCount: number } }> | null, assignedEvents: { nodes: Array<
      | { createdAt: string, assignee:
          | { login: string }
          | Record<PropertyKey, never>
         | null }
      | Record<PropertyKey, never>
     | null> | null } };

export type DashboardCountsQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardCountsQuery = { rateLimit: { cost: number, nodeCount: number, remaining: number, resetAt: string } | null, viewer: { login: string }, ownedPullRequests: { issueCount: number }, ownedIssues: { issueCount: number }, contributedPullRequests: { issueCount: number }, contributedIssues: { issueCount: number } };

export type ViewerRepositoriesQueryVariables = Exact<{
  first: number;
}>;


export type ViewerRepositoriesQuery = { rateLimit: { cost: number, nodeCount: number, remaining: number, resetAt: string } | null, viewer: { login: string, repositories: { nodes: Array<{ id: string, nameWithOwner: string, url: string, isPrivate: boolean } | null> | null }, repositoriesContributedTo: { nodes: Array<{ id: string, nameWithOwner: string, url: string, isPrivate: boolean } | null> | null } } };

export type PinnableRepositoryFragment = { id: string, nameWithOwner: string, url: string, isPrivate: boolean };

export const PullRequestCardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PullRequestCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PullRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isDraft"}},{"kind":"Field","name":{"kind":"Name","value":"mergeable"}},{"kind":"Field","name":{"kind":"Name","value":"mergeStateStatus"}},{"kind":"Field","name":{"kind":"Name","value":"reviewDecision"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusCheckRollup"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"changesRequestedReviews"},"name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"states"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"CHANGES_REQUESTED"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"reviewRequestedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"REVIEW_REQUESTED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewRequestedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"requestedReviewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<PullRequestCardFragment, unknown>;
export const SearchPullRequestFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SearchPullRequest"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SearchResultItemConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PullRequestCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PullRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isDraft"}},{"kind":"Field","name":{"kind":"Name","value":"mergeable"}},{"kind":"Field","name":{"kind":"Name","value":"mergeStateStatus"}},{"kind":"Field","name":{"kind":"Name","value":"reviewDecision"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusCheckRollup"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"changesRequestedReviews"},"name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"states"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"CHANGES_REQUESTED"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"reviewRequestedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"REVIEW_REQUESTED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewRequestedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"requestedReviewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SearchPullRequestFragment, unknown>;
export const IssueCardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IssueCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Issue"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"5"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"assignedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"ASSIGNED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AssignedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<IssueCardFragment, unknown>;
export const SearchIssueFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SearchIssue"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SearchResultItemConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IssueCard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IssueCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Issue"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"5"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"assignedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"ASSIGNED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AssignedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SearchIssueFragment, unknown>;
export const SearchCardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SearchCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SearchResultItemConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"IssueCard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PullRequestCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PullRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isDraft"}},{"kind":"Field","name":{"kind":"Name","value":"mergeable"}},{"kind":"Field","name":{"kind":"Name","value":"mergeStateStatus"}},{"kind":"Field","name":{"kind":"Name","value":"reviewDecision"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusCheckRollup"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"changesRequestedReviews"},"name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"states"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"CHANGES_REQUESTED"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"reviewRequestedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"REVIEW_REQUESTED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewRequestedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"requestedReviewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IssueCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Issue"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"5"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"assignedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"ASSIGNED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AssignedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SearchCardFragment, unknown>;
export const PinnableRepositoryFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PinnableRepository"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Repository"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"isPrivate"}}]}}]} as unknown as DocumentNode<PinnableRepositoryFragment, unknown>;
export const DashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Dashboard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reviewRequestsCursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assignedIssuesCursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ownedPullRequestsCursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ownedIssuesCursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"contributedPullRequestsCursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"contributedIssuesCursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mentionedCursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"authoredPullRequestsCursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"participatingCursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"changesRequestedCursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"failingChecksCursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"incomingPullRequestsCursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rateLimit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"nodeCount"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"resetAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"reviewRequests"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr review-requested:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reviewRequestsCursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"assignedIssues"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:issue assignee:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assignedIssuesCursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IssueCard"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"ownedPullRequests"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr author:@me user:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ownedPullRequestsCursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"ownedIssues"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:issue author:@me user:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ownedIssuesCursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IssueCard"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"contributedPullRequests"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr author:@me -user:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"contributedPullRequestsCursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"contributedIssues"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:issue author:@me -user:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"contributedIssuesCursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IssueCard"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"mentioned"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open mentions:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mentionedCursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"IssueCard"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"authoredPullRequests"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr author:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"authoredPullRequestsCursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"changesRequested"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr author:@me review:changes_requested sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"changesRequestedCursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"failingChecks"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr author:@me status:failure sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"failingChecksCursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"participating"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open commenter:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"participatingCursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"IssueCard"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"incomingPullRequests"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr -author:@me user:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"incomingPullRequestsCursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PullRequestCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PullRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isDraft"}},{"kind":"Field","name":{"kind":"Name","value":"mergeable"}},{"kind":"Field","name":{"kind":"Name","value":"mergeStateStatus"}},{"kind":"Field","name":{"kind":"Name","value":"reviewDecision"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusCheckRollup"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"changesRequestedReviews"},"name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"states"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"CHANGES_REQUESTED"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"reviewRequestedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"REVIEW_REQUESTED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewRequestedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"requestedReviewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IssueCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Issue"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"5"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"assignedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"ASSIGNED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AssignedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<DashboardQuery, DashboardQueryVariables>;
export const DashboardAttentionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashboardAttention"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rateLimit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"nodeCount"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"resetAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"reviewRequests"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr review-requested:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SearchPullRequest"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"assignedIssues"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:issue assignee:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SearchIssue"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"mentioned"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open mentions:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SearchCard"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"authoredPullRequests"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr author:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SearchPullRequest"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"changesRequested"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr author:@me review:changes_requested sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SearchPullRequest"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"failingChecks"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr author:@me status:failure sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SearchPullRequest"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"participating"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open commenter:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SearchCard"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"incomingPullRequests"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr -author:@me user:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SearchPullRequest"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PullRequestCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PullRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isDraft"}},{"kind":"Field","name":{"kind":"Name","value":"mergeable"}},{"kind":"Field","name":{"kind":"Name","value":"mergeStateStatus"}},{"kind":"Field","name":{"kind":"Name","value":"reviewDecision"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusCheckRollup"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"changesRequestedReviews"},"name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"states"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"CHANGES_REQUESTED"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"reviewRequestedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"REVIEW_REQUESTED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewRequestedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"requestedReviewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IssueCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Issue"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"5"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"assignedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"ASSIGNED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AssignedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SearchPullRequest"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SearchResultItemConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SearchIssue"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SearchResultItemConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IssueCard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SearchCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SearchResultItemConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"IssueCard"}}]}}]}}]} as unknown as DocumentNode<DashboardAttentionQuery, DashboardAttentionQueryVariables>;
export const DashboardOwnedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashboardOwned"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rateLimit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"nodeCount"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"resetAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"ownedPullRequests"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr author:@me user:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SearchPullRequest"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"ownedIssues"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:issue author:@me user:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SearchIssue"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PullRequestCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PullRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isDraft"}},{"kind":"Field","name":{"kind":"Name","value":"mergeable"}},{"kind":"Field","name":{"kind":"Name","value":"mergeStateStatus"}},{"kind":"Field","name":{"kind":"Name","value":"reviewDecision"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusCheckRollup"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"changesRequestedReviews"},"name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"states"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"CHANGES_REQUESTED"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"reviewRequestedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"REVIEW_REQUESTED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewRequestedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"requestedReviewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IssueCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Issue"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"5"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"assignedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"ASSIGNED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AssignedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SearchPullRequest"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SearchResultItemConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SearchIssue"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SearchResultItemConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IssueCard"}}]}}]}}]} as unknown as DocumentNode<DashboardOwnedQuery, DashboardOwnedQueryVariables>;
export const DashboardContributionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashboardContributions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rateLimit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"nodeCount"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"resetAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"contributedPullRequests"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr author:@me -user:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SearchPullRequest"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"contributedIssues"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:issue author:@me -user:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SearchIssue"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PullRequestCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PullRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isDraft"}},{"kind":"Field","name":{"kind":"Name","value":"mergeable"}},{"kind":"Field","name":{"kind":"Name","value":"mergeStateStatus"}},{"kind":"Field","name":{"kind":"Name","value":"reviewDecision"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusCheckRollup"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"changesRequestedReviews"},"name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"states"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"CHANGES_REQUESTED"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"reviewRequestedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"REVIEW_REQUESTED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewRequestedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"requestedReviewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IssueCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Issue"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"5"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"assignedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"ASSIGNED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AssignedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SearchPullRequest"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SearchResultItemConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SearchIssue"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SearchResultItemConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IssueCard"}}]}}]}}]} as unknown as DocumentNode<DashboardContributionsQuery, DashboardContributionsQueryVariables>;
export const DashboardSectionPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashboardSectionPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rateLimit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"nodeCount"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"resetAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"page"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PullRequestCard"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"IssueCard"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PullRequestCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PullRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isDraft"}},{"kind":"Field","name":{"kind":"Name","value":"mergeable"}},{"kind":"Field","name":{"kind":"Name","value":"mergeStateStatus"}},{"kind":"Field","name":{"kind":"Name","value":"reviewDecision"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusCheckRollup"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"changesRequestedReviews"},"name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"states"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"CHANGES_REQUESTED"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"reviewRequestedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"REVIEW_REQUESTED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewRequestedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"requestedReviewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IssueCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Issue"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"labels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"5"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reactionGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"reactors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerHasReacted"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"assignedEvents"},"name":{"kind":"Name","value":"timelineItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"IntValue","value":"10"}},{"kind":"Argument","name":{"kind":"Name","value":"itemTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"ASSIGNED_EVENT"}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AssignedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"assignee"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<DashboardSectionPageQuery, DashboardSectionPageQueryVariables>;
export const DashboardCountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashboardCounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rateLimit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"nodeCount"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"resetAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"ownedPullRequests"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr author:@me user:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"ownedIssues"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:issue author:@me user:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"contributedPullRequests"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:pr author:@me -user:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"contributedIssues"},"name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"StringValue","value":"is:open is:issue author:@me -user:@me sort:updated-desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"ISSUE"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueCount"}}]}}]}}]} as unknown as DocumentNode<DashboardCountsQuery, DashboardCountsQueryVariables>;
export const ViewerRepositoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ViewerRepositories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rateLimit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"nodeCount"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"resetAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"}},{"kind":"Field","name":{"kind":"Name","value":"repositories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"affiliations"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"OWNER"},{"kind":"EnumValue","value":"COLLABORATOR"},{"kind":"EnumValue","value":"ORGANIZATION_MEMBER"}]}},{"kind":"Argument","name":{"kind":"Name","value":"isArchived"},"value":{"kind":"BooleanValue","value":false}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"field"},"value":{"kind":"EnumValue","value":"PUSHED_AT"}},{"kind":"ObjectField","name":{"kind":"Name","value":"direction"},"value":{"kind":"EnumValue","value":"DESC"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PinnableRepository"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"repositoriesContributedTo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"contributionTypes"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"COMMIT"},{"kind":"EnumValue","value":"PULL_REQUEST"},{"kind":"EnumValue","value":"PULL_REQUEST_REVIEW"},{"kind":"EnumValue","value":"ISSUE"}]}},{"kind":"Argument","name":{"kind":"Name","value":"includeUserRepositories"},"value":{"kind":"BooleanValue","value":false}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"field"},"value":{"kind":"EnumValue","value":"PUSHED_AT"}},{"kind":"ObjectField","name":{"kind":"Name","value":"direction"},"value":{"kind":"EnumValue","value":"DESC"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PinnableRepository"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PinnableRepository"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Repository"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameWithOwner"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"isPrivate"}}]}}]} as unknown as DocumentNode<ViewerRepositoriesQuery, ViewerRepositoriesQueryVariables>;
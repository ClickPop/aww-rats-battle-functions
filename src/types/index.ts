import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import {
  AddSoloEncounterAttemptMutationVariables,
  GetEncounterByIdQuery,
  GetPlayerByIdQuery,
  GetRatsByIdsQuery,
  Roles_Enum,
  SoloEncounterAttemptResult,
  UpsertPlayerMutation,
  RaidContributionResult,
  GetRaidbyIdQuery,
  AddRaidContributionMutationVariables,
} from 'src/schema/generated';
export * from 'src/schema/generated';
import { HASURA_BASE_URL } from 'src/config/env';

/**
 * Opensea
 * */

// This is the main metadata object that will be returned from our OpenSea compliant contracts
export type Metadata = {
  image: string;
  name: string;
  description?: string;
  attributes: OpenSeaAttribute[];
};

// This is the shape the attributes can take
export type OpenSeaAttribute = {
  trait_type?: string;
  display_type?:
    | 'string'
    | 'number'
    | 'boost_percentage'
    | 'boost_number'
    | 'date';
  value: string | number;
  max_value?: number;
};

/**
 * Hasura
 * */

type HasuraSessionVariables = {
  'x-hasura-user-id': string;
  'x-hasura-role': 'user' | 'anonymous';
};

// These are the basic shapes of the request body coming in from Hasura into an action or trigger handler
export type HasuraActionReqBody = {
  action: {
    name: string;
  };
  input: Record<string, unknown>;
  session_variables: HasuraSessionVariables;
  request_query: string;
};

export type HasuraTriggerReqBody = {
  event: {
    session_variables: HasuraSessionVariables;
    op: 'INSERT' | 'UPDATE' | 'DELETE' | 'MANUAL';
    data: {
      old: Record<string, unknown> | null;
      new: Record<string, unknown> | null;
    };
  };
  created_at: string;
  id: string;
  trigger: {
    name: string;
  };
  table: {
    schema: string;
    name: string;
  };
};

export type HasuraEventReqBody = {
  payload?: Record<string, unknown>;
  scheduled_time: string;
  created_at: string;
  id: string;
};

// These are generic types used for the hasura actions/triggers
export type HasuraActionHandler<
  ResponseBody,
  RequestBody = HasuraActionReqBody,
  QueryParams = qs.ParsedQs,
  ResponseLocals = Record<string, unknown>,
> = RequestHandler<
  ParamsDictionary,
  ResponseBody,
  RequestBody,
  QueryParams,
  ResponseLocals
>;

export type HasuraTriggerHandler<
  ResponseBody,
  RequestBody = HasuraTriggerReqBody,
  QueryParams = qs.ParsedQs,
  ResponseLocals = Record<string, unknown>,
> = RequestHandler<
  ParamsDictionary,
  ResponseBody,
  RequestBody,
  QueryParams,
  ResponseLocals
>;

export type HasuraEventHandler<
  ResponseBody,
  RequestBody = HasuraEventReqBody,
  QueryParams = qs.ParsedQs,
  ResponseLocals = Record<string, unknown>,
> = RequestHandler<
  ParamsDictionary,
  ResponseBody,
  RequestBody,
  QueryParams,
  ResponseLocals
>;

type RetryConf = {
  num_retries?: number;
  retry_interval_seconds?: number;
  timeout_seconds?: number;
  tolerance_seconds?: number;
};

type HeaderObject = {
  name: string;
  value: string;
};

type HeaderFromEnvObject = {
  name: string;
  value_from_env: string;
};

type HeaderArray = [HeaderObject | HeaderFromEnvObject];

export interface MetadataApiBody {
  type: string;
  version?: number;
  resource_version?: number;
  args: Record<string, unknown>;
}

export interface CreateScheduledEventBody extends MetadataApiBody {
  type: 'create_scheduled_event';
  args: {
    webhook: string;
    schedule_at: string;
    payload?: Record<string, unknown>;
    headers?: HeaderArray;
    retry_conf?: RetryConf;
    comment?: string;
  };
}

export interface DeleteScheduledEventBody extends MetadataApiBody {
  type: 'delete_scheduled_event';
  args: {
    type: 'one_off' | 'cron';
    event_id: string;
  };
}

//Auth Hook Response handler
export type HasuraAuthHookReponseBody =
  | {
      'X-Hasura-User-Id'?: string;
      'X-Hasura-Role': Roles_Enum;
    }
  | { error: any };

// Auth hook handler
export type HasuraAuthHook = RequestHandler<
  ParamsDictionary,
  HasuraAuthHookReponseBody,
  {},
  qs.ParsedQs,
  { auth: string }
>;

// Login action handler using the action handler generic
export type HasuraLoginHandler = HasuraActionHandler<
  UpsertPlayerMutation['insert_players_one'] | { error: unknown },
  { action: { name: 'login' }; input: { wallet: string; msg: string } }
>;

// Function Encounter types
interface EncounterAttempBody extends HasuraActionReqBody {
  input: { encounter_id: number; rat_ids: string[] };
}

interface RaidContributionBody extends HasuraActionReqBody {
  input: { raid_id: number; rat_ids: string[] };
}

type PlayerLocals = { player: GetPlayerByIdQuery['players_by_pk'] };
type EncounterLocals = {
  encounter: GetEncounterByIdQuery['encounters_by_pk'];
};
type RaidLocals = {
  raid: GetRaidbyIdQuery['raids_by_pk'];
};
type RatLocals = { rats: GetRatsByIdsQuery['rats'] };
type AttemptLocals = { attempt: AddSoloEncounterAttemptMutationVariables };
type ContributionLocals = {
  contribution: AddRaidContributionMutationVariables;
};

interface TokenBody extends HasuraActionReqBody {
  input: {
    rat_ids: string[];
  };
}

export type PlayerMiddleware = HasuraActionHandler<
  {},
  HasuraActionReqBody,
  qs.ParsedQs,
  PlayerLocals
>;

export type EncounterMiddleware = HasuraActionHandler<
  {},
  EncounterAttempBody,
  qs.ParsedQs,
  PlayerLocals & EncounterLocals
>;

export type RaidMiddleware = HasuraActionHandler<
  {},
  RaidContributionBody,
  qs.ParsedQs,
  PlayerLocals & RaidLocals
>;

export type RatMiddleware = HasuraActionHandler<
  {},
  TokenBody,
  qs.ParsedQs,
  PlayerLocals & RatLocals
>;

export type CheckTokenMiddleware = HasuraActionHandler<
  {},
  TokenBody,
  qs.ParsedQs,
  PlayerLocals
>;

export type VerifyEncounterMiddleware = HasuraActionHandler<
  {},
  TokenBody,
  qs.ParsedQs,
  PlayerLocals & RatLocals & EncounterLocals
>;

export type VerifyRaidMiddleware = HasuraActionHandler<
  {},
  TokenBody,
  qs.ParsedQs,
  PlayerLocals & RatLocals & RaidLocals
>;

export type SoloEncounterAttempt = HasuraActionHandler<
  Omit<SoloEncounterAttemptResult, '__typename'> | { error: string },
  TokenBody,
  qs.ParsedQs,
  PlayerLocals & RatLocals & AttemptLocals & EncounterLocals
>;

export type RaidContribution = HasuraActionHandler<
  Omit<RaidContributionResult, '__typename'> | { error: string },
  RaidContributionBody,
  qs.ParsedQs,
  PlayerLocals & RaidLocals & RatLocals & ContributionLocals
>;

export interface ErrorObj {
  code: number;
  msg: string;
  error?: Error;
}

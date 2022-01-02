import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
export * from '../schema/generated';

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

// A union type of possible hasura roles
export type HasuraRoles = 'user' | 'anonymous';

// This is the basic shape of the request body coming in from Hasura into an action handler
export type HasuraActionReqBody = {
  action: {
    name: string;
  };
  input: Record<string, unknown>;
  session_variables: {
    'x-hasura-user-id': string;
    'x-hasura-role': 'user' | 'anonymous';
  };
  request_query: string;
};

// This is generic type to use for the action handlers
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

//Auth Hook Response handler
export type HasuraAuthHookReponseBody = {
  'X-Hasura-User-Id'?: string;
  'X-Hasura-Role': HasuraRoles;
} | { error: any } 


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
  { authorized: boolean },
  { action: { name: 'login' }; input: { wallet: string; msg: string } }
>;

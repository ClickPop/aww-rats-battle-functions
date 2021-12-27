export * from '../schema/generated';

export type Metadata = {
  image: string;
  name: string;
  description: string;
  attributes: OpenSeaAttribute[];
};

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

import { JExcelElement, Column, CellValue } from 'jexcel';

const PE_SAMPLE_DATA: CellValue[] = [];

const PE_STATIC_COLUMNS: Column[] = [
  {
    title: 'ID',
    width: 100,
    primaryKey: true,
    type: 'hidden'
  },
  {
    title: 'Name',
    width: 100
  },
  {
    title: 'PosType',
    width: 100
  },
  {
    title: 'Pseduo ISIN',
    width: 100
  },
  {
    title: 'Comment',
    width: 100
  },
  {
    title: 'Org Number',
    width: 100
  },
  {
    title: 'Listed',
    width: 100
  },
  {
    title: 'Category1',
    width: 100
  },
  {
    title: 'Category2',
    width: 100
  },
  {
    title: 'Category3',
    width: 100
  },
  {
    title: 'Category4',
    width: 100
  }
];

export const PRIVATE_EQUITY_STATIC_TABLE_DEFAULT_CONFIG: jexcel.Options = {
  data: [
    {
      ID: '44586d11-41c4-4a2e-8bac-9a639ae7a94d',
      name: 'Acast',
      posType: 'Non-listed'
    }
  ],
  columns: PE_STATIC_COLUMNS,
  minDimensions: [10, 10]
};

export const PRIVATE_EQUITY_SAMPLE_TRANSACTIONS = [];

export interface Employee {
  id: string
  name: string
  position: string
  avatarUrl: string
}

export const mockEmployees: Employee[] = [
  {
    id: 'john',
    avatarUrl:
      'https://jas3.hb.kz-ast.bizmrg.com/shai_contest/erika.jpg',
    name: 'John Doe',
    position: 'Frontend Developer',
  },
  {
    id: 'jane',
    avatarUrl:
      'https://jas3.hb.kz-ast.bizmrg.com/shai_contest/zhan.jpg',
    name: 'Jane Smith',
    position: 'Product Manager',
  },
]



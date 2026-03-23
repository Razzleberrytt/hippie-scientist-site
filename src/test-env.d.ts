declare module 'vitest' {
  export const describe: (...args: any[]) => any
  export const it: (...args: any[]) => any
  export const expect: (...args: any[]) => any
}

declare module '@testing-library/react' {
  export const render: (...args: any[]) => any
  export const screen: Record<string, (...args: any[]) => any>
}

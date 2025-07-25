import React from 'react'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Container: React.FC<Props> = ({ children, className = '', ...rest }) => {
  return (
    <div
      className={`mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export default Container

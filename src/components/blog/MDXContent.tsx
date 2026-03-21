'use client'

import * as runtime from 'react/jsx-runtime'
import InlineCTA from '@/components/blog/InlineCTA'

const useMDXComponent = (code: string) => {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

const mdxComponents = {
  InlineCTA,
}

interface MDXProps {
  code: string
}

export const MDXContent = ({ code }: MDXProps) => {
  const Component = useMDXComponent(code)
  return <Component components={mdxComponents} />
}

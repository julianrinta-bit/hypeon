'use client'

import * as runtime from 'react/jsx-runtime'
import InlineCTA from '@/components/blog/InlineCTA'
import ReadAlso from '@/components/blog/ReadAlso'

const useMDXComponent = (code: string) => {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

const mdxComponents = {
  InlineCTA,
  ReadAlso,
}

interface MDXProps {
  code: string
}

export const MDXContent = ({ code }: MDXProps) => {
  const Component = useMDXComponent(code)
  return <Component components={mdxComponents} />
}

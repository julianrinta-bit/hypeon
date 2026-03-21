'use client'

import * as runtime from 'react/jsx-runtime'
import InlineCTA from '@/components/blog/InlineCTA'
import ReadAlso from '@/components/blog/ReadAlso'
import NewsletterCTA from '@/components/blog/NewsletterCTA'

const useMDXComponent = (code: string) => {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

const mdxComponents = {
  InlineCTA,
  ReadAlso,
  NewsletterCTA,
}

interface MDXProps {
  code: string
}

export const MDXContent = ({ code }: MDXProps) => {
  const Component = useMDXComponent(code)
  return <Component components={mdxComponents} />
}

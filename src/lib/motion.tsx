import { createElement, forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
// Re-export shim: allows centralized import control and future test mocking.
import {
  AnimatePresence,
  animate,
  motion as baseMotion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionProps,
} from 'framer-motion'

export type { MotionProps } from 'framer-motion'

export {
  AnimatePresence,
  animate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
}

export type HTMLMotionProps<Tag extends keyof HTMLElementTagNameMap> = Omit<
  ComponentPropsWithoutRef<Tag>,
  keyof MotionProps
> &
  MotionProps

type MotionTag = 'article' | 'button' | 'div' | 'h1' | 'h2' | 'p' | 'section' | 'span'

function createMotionComponent<Tag extends MotionTag>(tag: Tag) {
  const MotionComponent = forwardRef<HTMLElementTagNameMap[Tag], HTMLMotionProps<Tag>>(
    (props, ref) => {
      const Component = baseMotion[tag] as any
      return createElement(Component, { ...props, ref } as any)
    }
  )

  MotionComponent.displayName = `Motion.${tag}`

  return MotionComponent
}

export const motion = {
  article: createMotionComponent('article'),
  button: createMotionComponent('button'),
  div: createMotionComponent('div'),
  h1: createMotionComponent('h1'),
  h2: createMotionComponent('h2'),
  p: createMotionComponent('p'),
  section: createMotionComponent('section'),
  span: createMotionComponent('span'),
}

#!/usr/bin/env node
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const FROZEN_MESSAGE = 'Metricool publication is frozen by THS SocialOS. Use THS Publisher so every new post has a canonical publication_id.'

export async function scheduleMetricoolPublicationFromArtifacts() {
  throw new Error(FROZEN_MESSAGE)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  throw new Error(FROZEN_MESSAGE)
}

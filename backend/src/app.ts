import cors from 'cors'
import express from 'express'
import type { ScoutDocumentStore } from './store'
import type { CreateScoutDocumentInput, DecideScoutDocumentInput } from './types'

const ensureText = (value: unknown, fieldName: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} is required`)
  }

  return value.trim()
}

export const createApp = (store: ScoutDocumentStore, frontendOrigin = 'http://localhost:5173') => {
  const app = express()

  app.use(cors({ origin: frontendOrigin }))
  app.use(express.json())

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' })
  })

  app.get('/api/scout-documents', async (_request, response, next) => {
    try {
      response.json(await store.list())
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/scout-documents', async (request, response, next) => {
    try {
      const input: CreateScoutDocumentInput = {
        candidateName: ensureText(request.body.candidateName, 'candidateName'),
        scoutTitle: ensureText(request.body.scoutTitle, 'scoutTitle'),
        scoutBody: ensureText(request.body.scoutBody, 'scoutBody'),
        createdBy: ensureText(request.body.createdBy, 'createdBy'),
      }

      response.status(201).json(await store.create(input))
    } catch (error) {
      next(error)
    }
  })

  app.patch('/api/scout-documents/:id/decision', async (request, response, next) => {
    try {
      const id = Number.parseInt(request.params.id, 10)
      if (Number.isNaN(id)) {
        response.status(400).json({ message: 'A numeric id is required' })
        return
      }

      const action = request.body.action
      if (action !== 'approve' && action !== 'return') {
        response.status(400).json({ message: 'action must be approve or return' })
        return
      }

      const input: DecideScoutDocumentInput = {
        action,
        comment: typeof request.body.comment === 'string' ? request.body.comment.trim() : '',
        decidedBy: ensureText(request.body.decidedBy, 'decidedBy'),
      }

      const updatedDocument = await store.decide(id, input)

      if (!updatedDocument) {
        response.status(404).json({ message: 'Scout document not found' })
        return
      }

      response.json(updatedDocument)
    } catch (error) {
      next(error)
    }
  })

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    response.status(400).json({ message })
  })

  return app
}

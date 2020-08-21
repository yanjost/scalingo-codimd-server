import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { NotesService } from '../../src/notes/notes.service';

describe('Notes', () => {
  let app: INestApplication;
  let notesService: NotesService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    notesService = moduleRef.get(NotesService);
    await app.init();
  });

  it(`POST /notes`, async () => {
    const newNote = 'This is a test note.';
    const response = await request(app.getHttpServer())
      .post('/notes')
      .send(newNote)
      .expect('Content-Type', /json/)
      .expect(201);
    expect(response.body.metadata?.id).toBeDefined();
    expect(
      notesService.getNoteByIdOrAlias(response.body.metadata.id).content,
    ).toEqual(newNote);
  });

  it(`GET /notes/{note}`, async () => {
    notesService.createNote('This is a test note.', 'test1');
    const response = await request(app.getHttpServer())
      .get('/notes/test1')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body.content).toEqual('This is a test note.');
  });

  it(`POST /notes/{note}`, async () => {
    const newNote = 'This is a test note.';
    const response = await request(app.getHttpServer())
      .post('/notes/test2')
      .send(newNote)
      .expect('Content-Type', /json/)
      .expect(201);
    expect(response.body.metadata?.id).toBeDefined();
    return expect(
      notesService.getNoteByIdOrAlias(response.body.metadata.id).content,
    ).toEqual(newNote);
  });

  it(`DELETE /notes/{note}`, async () => {
    notesService.createNote('This is a test note.', 'test3');
    await request(app.getHttpServer())
      .delete('/notes/test3')
      .expect(200);
    return expect(notesService.getNoteByIdOrAlias('test3')).toBeNull();
  });

  it(`PUT /notes/{note}`, async () => {
    notesService.createNote('This is a test note.', 'test4');
    await request(app.getHttpServer())
      .put('/notes/test4')
      .send('New note text')
      .expect(200);
    return expect(notesService.getNoteByIdOrAlias('test4').content).toEqual(
      'New note text',
    );
  });

  it.skip(`PUT /notes/{note}/metadata`, () => {
    // TODO
    return request(app.getHttpServer())
      .post('/notes/test5/metadata')
      .expect(200);
  });

  it.skip(`GET /notes/{note}/metadata`, () => {
    notesService.createNote('This is a test note.', 'test6');
    return request(app.getHttpServer())
      .get('/notes/test6/metadata')
      .expect(200);
    // TODO: Find out how to check the structure of the returned JSON
  });

  it(`GET /notes/{note}/revisions`, async () => {
    notesService.createNote('This is a test note.', 'test7');
    const response = await request(app.getHttpServer())
      .get('/notes/test7/revisions')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body.revisions).toHaveLength(1);
  });

  it(`GET /notes/{note}/revisions/{revision-id}`, async () => {
    notesService.createNote('This is a test note.', 'test8');
    const response = await request(app.getHttpServer())
      .get('/notes/test8/revisions/1')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body.content).toEqual('This is a test note.');
  });

  it(`GET /notes/{note}/content`, async () => {
    notesService.createNote('This is a test note.', 'test9');
    const response = await request(app.getHttpServer())
      .get('/notes/test9/content')
      .expect(200);
    expect(response.body).toEqual('This is a test note.');
  });

  afterAll(async () => {
    await app.close();
  });
});

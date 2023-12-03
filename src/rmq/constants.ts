import { Inject } from '@nestjs/common';

export const FOO_QUEUE = 'foo';
export const FOO_CLIENT_NAME = Symbol('foo-rmq-client');
export const InjectFooClient = () => Inject(FOO_CLIENT_NAME);
export const HELLO_MESSAGE = 'hello';

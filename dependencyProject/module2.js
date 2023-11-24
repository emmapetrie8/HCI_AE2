// module2.js
import { greet } from './module1';

export function welcome(name) {
    return `${greet(name)} Welcome to the project!`;
}

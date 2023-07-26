import React from "react";
import { action } from "@storybook/addon-actions";
import App from "./App";
import {
  BrowserRouterProviderDecorator,
  ReduxStoreProviderDecorator
} from '../stories/decorators/ReduxStoreProviderDecorator';

export default {
  title: "App Stories",
  component: App,
  decorators: [ReduxStoreProviderDecorator,BrowserRouterProviderDecorator],
};


export const AppBaseExample = (props: any) => {
  return <App demo={true} />;
};










async function abc() {
  console.log(8)

  await Promise.resolve(2)
      .then(console.log)

  console.log(3)
}

setTimeout(() => {
  console.log(1)
}, 0)

abc()

queueMicrotask(() => {
  console.log(0)
})

Promise.resolve(4)
    .then(console.log)

console.log(6)




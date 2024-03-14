import { handler } from './action2';
import { Chat } from './chat';
 

export default function Page() {
  return <Chat handler={handler} />;
}
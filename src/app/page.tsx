import "$/app/page.css"
import App from "$/components/App"
import { ROOT_ELEMENT_ID } from "$/helpers/constants"

export default function Home() {
  return (
    // tabindex set to 0 allowing chromium to focus
    // https://issues.chromium.org/issues/41162655
    <div id={ROOT_ELEMENT_ID} tabIndex={0}>
      <App />
    </div>
  )
}

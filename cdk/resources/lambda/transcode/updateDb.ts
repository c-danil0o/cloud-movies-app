async function handler(event: any, context: any) {
  console.log("post map")
  console.log(event)
  return event;
}

export { handler };


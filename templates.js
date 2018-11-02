function readme (name) {
  return `# ${name}

## Mission

## Collaborators

## Criteria for success

## Tracking Location`
}

function daily (heading, routines, tasks, next) {
  return `# ${heading}

## Mission
${routines}
## To Do
${tasks}
## Roundup
${next}
`
}

module.exports = {
  readme,
  daily
}

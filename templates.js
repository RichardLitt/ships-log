function readme (name) {
  return `# ${name}

## Mission

## Collaborators

## Criteria for success

## Tracking Location`
}

function daily (heading, tasks, routines, next) {
  return `# ${heading}

## Mission

## To Do
${tasks}${routines}
## Daily Journal

## Roundup
${(next) ? next + '\n' : ''}`
}

module.exports = {
  readme,
  daily
}

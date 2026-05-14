# UI Spec

## Description
A short description of the UI and what it enables.

## Pages

### Page: {name}
- Route: {path}
- Layout: {layout component}
- Display: {what the user sees — visual content description, data shown, interactions}
- Data: {data entities displayed, referenced from <!-- narukana-ui-data -->}
- Components: {list of technical components}
- Actions: {list of actions available on this page}

### Page: {name}
- Route: {path}
- Layout: {layout component}
- Display: {description}
- Data: {data entities}
- Components: {list}
- Actions: {list}

## States
- loading
- empty
- error
- success

<!-- narukana-ui-actions -->
- action: {name} (Page: {page})
- action: {name} (Page: {page})
<!-- /narukana-ui-actions -->

<!-- narukana-ui-data -->
- entity: {name}: {field1}, {field2}, ...
- entity: {name}: {field1}, {field2}, ...
<!-- /narukana-ui-data -->

## User Flow
1) User opens app → lands on {page}
2) User triggers {action} on {page}
3) UI calls {operation}
4) UI displays result on {page}

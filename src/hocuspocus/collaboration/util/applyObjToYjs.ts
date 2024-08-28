import * as Y from "yjs";

const syncArrayToYArray = (arr: any[], yarray: Y.Array<any>) => {
  yarray.delete(0, yarray.length) // Clear existing content
  arr.forEach((item) => {
    if (typeof item === 'object' && item !== null) {
      if (Array.isArray(item)) {
        // Handle nested arrays
        let nestedYArray = new Y.Array()
        syncArrayToYArray(item, nestedYArray)
        yarray.push([nestedYArray])
      } else {
        // Handle objects in arrays
        let nestedMap = new Y.Map()
        applyObjToYjs(nestedMap, item)
        yarray.push([nestedMap])
      }
    } else if (typeof item === 'string') {
      // Handle strings with Y.Text
      let ytext = new Y.Text(item)
      yarray.push([ytext])
    } else {
      // Handle primitive values in arrays
      yarray.push([item])
    }
  })
}

export const applyObjToYjs = (ymap: Y.Map<unknown>, obj: Object) => {
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        // Handle arrays
        try {
          let yarray = ymap.get(key) as Y.Array<unknown>
          if (!yarray) {
            yarray = new Y.Array()
            ymap.set(key, yarray)
          }
          syncArrayToYArray(value, yarray)
        } catch (e) {
          console.log("ARRAY ERROR", {key, value}, e)
        }
      } else {
       try {
         // Handle objects
         let nestedMap = ymap.get(key) as Y.Map<unknown>
         if (!nestedMap) {
           nestedMap = new Y.Map()
           ymap.set(key, nestedMap)
         }
         applyObjToYjs(nestedMap, value)
       } catch (e) {
         console.log("OBJECT ERROR", {key, value})
       }
      }
    } else if (typeof value === 'string') {
      try {
        // Handle strings with Y.Text
        let ytext = ymap.get(key) as Y.Text
        if (!ytext) {
          ytext = new Y.Text(value)
          ymap.set(key, ytext)
        } else {
          ytext.delete(0, ytext.length)
          ytext.insert(0, value)
        }
      } catch (e){
        console.log("STRING ERROR")
      }
    } else {
      // Handle other primitive values
      ymap.set(key, value)
    }
  })
}

const commentRegex = /<!--[\s\S]*?-->/g;

export function replaceCommentsWithEmptySpace(content: string) {
  return content.replace(commentRegex, (comment)  =>  {
    let mock = "";

    let index = 0;
    while(index < comment.length) {
      mock += " ";
      index++;
    }

    return mock;
  });
}

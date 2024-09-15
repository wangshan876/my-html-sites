Quill.js api
=================

1. **创建编辑器实例**：
   ```javascript
   var quill = new Quill('#editor', {
     theme: 'snow', // 主题
     modules: {
       toolbar: [
         ['bold', 'italic', 'underline'], // 加粗、斜体、下划线
         ['link', 'image'] // 链接、图片
       ]
     }
   });
   ```

2. **获取内容**：
   ```javascript
   var html = quill.root.innerHTML; // 获取 HTML 内容
   var delta = quill.getContents(); // 获取 Delta 格式内容
   ```

3. **设置内容**：
   ```javascript
   quill.setContents(delta); // 设置 Delta 格式内容
   quill.root.innerHTML = '<p>新内容</p>'; // 设置 HTML 内容
   ```

4. **插入内容**：
   ```javascript
   quill.insertText(0, 'Hello, World!'); // 在指定位置插入文本
   quill.insertEmbed(1, 'image', 'https://example.com/image.png'); // 插入图片
   ```

5. **撤销和重做**：
   ```javascript
   quill.history.undo(); // 撤销
   quill.history.redo(); // 重做
   ```

6. **获取和设置格式**：
   ```javascript
   var format = quill.getFormat(); // 获取当前格式
   quill.format('bold', true); // 设置文本为加粗
   ```

7. **监听事件**：
   ```javascript
   quill.on('text-change', function(delta, oldDelta, source) {
     console.log('内容变化', delta);
   });
   ```

8. **清空内容**：
   ```javascript
   quill.setText(''); // 清空编辑器内容
   ```

这些 API 可以帮助你在使用 Quill.js 时实现各种功能。你可以根据需要查阅 [Quill.js 官方文档](https://quilljs.com/docs/api/) 以获取更详细的信息和示例。
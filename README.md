# easily-post-editor

이즐리에서 사용하는 게시글 에디터 컴포넌트 패키지입니다.

## 사전 조건

- React 17 이상이 설치되어 있어야 합니다.
- lucide-react가 설치되어 있어야 합니다.

## 설치

```bash
npm install @jojicompany-dev/easily-post-editor
```

## Props

```tsx
initialContent: Record<string, any>;
```

> 이즐리 api로부터 전달받은 게시글 데이터 객체를 담습니다.

```tsx
isReadOnly: boolean;
```

> 읽기 전용 모드 여부를 담습니다. 게시글을 보여주는 목적으로 사용할 경우에는 true로 설정합니다.

```tsx
onChange: (editorState: EditorState) => void
```

> 게시글 내용이 변경될 때 호출되는 함수입니다. isReadOnly가 true일 때는 불필요합니다.

```tsx
onUploadImage: (file: File) => Promise<string | null>;
```

> 이미지 업로드가 일어날 때 호출되는 함수입니다. isReadOnly가 true일 때는 불필요합니다.

## 예시

```tsx
import { CommunityPostEditor } from "@jojicompany-dev/easily-post-editor";

export function CommunityPostDetailPage() {
  const [content, setContent] = useState<Record<string, any>>({});

  useEffect(() => {
    // 이즐리 api로부터 게시글 데이터를 받아옵니다.
    const response = await fetch("{api_url}/posts/123");
    const data = await response.json();
    setContent(data.content);
  }, []);

  return <CommunityPostEditor initialContent={content} isReadOnly={true} />;
}
```

import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";

export default function UrlButton(props: {
  url: Url;
  text: string;
  color: string;
}) {
  return (
    <Link
      className={"text-5xl font-extrabold tracking-wide " + props.color}
      href={props.url}
    >
      {props.text} {">"}
    </Link>
  );
}

import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";

export default function UrlButton(props: {
  url: Url;
  text: string;
  color: string;
  classNames: string;
}) {
  return (
    <Link
      className={
        "font-extrabold tracking-wide " + props.color + " " + props.classNames
      }
      href={props.url}
    >
      {props.text} {">"}
    </Link>
  );
}

import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { AnchorHTMLAttributes, cloneElement, DetailedHTMLProps, ReactElement } from "react";
import styles from "../Header/styles.module.scss"

interface ActiveLinkProps extends LinkProps {
  children: ReactElement;
  activeClassName: string;
}

export default function ActiveLink({ children, activeClassName, ...rest }: ActiveLinkProps) {
  const { asPath } = useRouter()

  const className = asPath === rest.href ? activeClassName : ''

  return (
    <Link {...rest}>
      {cloneElement(children, { className })}
    </Link>
  )
}
import React from 'react'

/**
 * Message renderer
 * @param {object} param0
 */
export default function Message ({ peers, message }) {
  return (
    <li>
      <p>{message.toString()}</p>
    </li>
  )
}

import React from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo";
import Spinner from "react-svg-spinner";

import actionsToText from "../../../utils/actionsToText.json";
import styles from "./Actions.module.scss";

const PLAY_TRUCO = gql`
  mutation playTruco($matchId: ID!, $action: TrucoActions!) {
    playTruco(matchId: $matchId, action: $action) {
      success
      message
    }
  }
`;

const PLAY_ENVIDO = gql`
  mutation playTruco($matchId: ID!, $action: EnvidoActions!) {
    playEnvido(matchId: $matchId, action: $action) {
      success
      message
    }
  }
`;

const SAY_ENVIDO = gql`
  mutation sayEnvido($matchId: ID!, $action: SayEnvidoActions!) {
    sayEnvido(matchId: $matchId, action: $action) {
      success
      message
    }
  }
`;

const LEAVE_ROUND = gql`
  mutation leaveRound($matchId: ID!) {
    leaveRound(matchId: $matchId) {
      success
      message
    }
  }
`;

export default function ActionsList({
  matchId,
  ourAction,
  theirAction,
  sayEnvidoActions = [],
  envidoPoints,
  envidoActions = [],
  trucoActions = []
}) {
  const [playTruco] = useMutation(PLAY_TRUCO);
  const [playEnvido] = useMutation(PLAY_ENVIDO);
  const [sayEnvido] = useMutation(SAY_ENVIDO);
  const [leaveRound] = useMutation(LEAVE_ROUND);

  return (
    <div className={styles.actions}>
      {theirAction && (
        <div className={styles.playerAction}>
          Cantaron <span>{actionsToText[theirAction]}</span>
        </div>
      )}
      {ourAction && (
        <>
          <div className={styles.playerAction}>
            Cantaste <span>{actionsToText[ourAction]}</span>
          </div>
          <div className={styles.waitForResponse}>
            <Spinner color="rgba(255,255,255, 0.5)" />
            <span>Esperando respuesta</span>
          </div>
        </>
      )}
      {sayEnvidoActions && sayEnvidoActions.length > 0 && (
        <div className={styles.actionsType}>
          {sayEnvidoActions.map(action => (
            <button
              key={action}
              className={styles.action}
              onClick={() => sayEnvido({ variables: { matchId, action } })}
            >
              {actionsToText[action].replace("{{points}}", envidoPoints)}
            </button>
          ))}
        </div>
      )}
      {envidoActions && envidoActions.length > 0 && (
        <div className={styles.actionsType}>
          {envidoActions.map(action => (
            <button
              key={action}
              className={styles.action}
              onClick={() => playEnvido({ variables: { matchId, action } })}
            >
              {actionsToText[action]}
            </button>
          ))}
        </div>
      )}
      {envidoActions.length >= 1 && trucoActions.length >= 1 && (
        <span className={styles.divider} />
      )}
      {trucoActions && trucoActions.length > 0 && (
        <div className={styles.actionsType}>
          {trucoActions.map(action => (
            <button
              key={action}
              className={styles.action}
              onClick={() => playTruco({ variables: { matchId, action } })}
            >
              {actionsToText[action]}
            </button>
          ))}
        </div>
      )}
      <span className={styles.divider} />
      <div className={styles.actionsType}>
        <button
          key="leaveRound"
          className={styles.action}
          onClick={() => leaveRound({ variables: { matchId } })}
        >
          {actionsToText.LEAVE_ROUND}
        </button>
      </div>
    </div>
  );
}

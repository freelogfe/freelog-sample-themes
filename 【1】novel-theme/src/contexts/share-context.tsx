import React from "react";

export const ShareContext = React.createContext<{ openShare: () => void }>({
  openShare: () => {}
});

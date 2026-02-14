{
  description = "Astro blog development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Bun runtime for Astro
            bun
            
            # Node.js (some Astro tooling may need it)
            nodejs_20
            
            # Git for version control
            git
          ];

          shellHook = ''
            echo "🚀 Astro Blog Development Environment"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "Bun version: $(bun --version)"
            echo "Node version: $(node --version)"
            echo ""
            echo "Quick start:"
            echo "  bunx create-astro@latest . -- --template minimal --typescript strict"
            echo "  bun install"
            echo "  bun run dev"
            echo ""
          '';
        };
      }
    );
}

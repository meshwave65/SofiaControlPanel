import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog<div className="relative">
                          <FormControl>
  
                            <Input 
                              type={showToken ? "text" : "password"}
                              placeholder="sk-..." 
                              {...field} 
                              className="cad-box font-mono pr-10" 
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                          >
                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        
                        </div>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 pt-4 border-t border-foreground/10">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)} 
                  className="uppercase font-bold text-[10px] tracking-widest h-11 px-6"
                >
                  Abortar Operação
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAgentMutation.isPending || updateAgentMutation.isPending}
                  className="bg-accent text-accent-foreground font-bold uppercase tracking-widest text-[10px] h-11 px-8 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]"
                >
                  {(createAgentMutation.isPending || updateAgentMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEditMode ? "Confirmar Atualização" : "Confirmar Inicialização"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="bg-card border-2 border-destructive/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-destructive flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Confirmar Desativação Permanente
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            Esta ação irá deletar permanentemente a unidade <span className="font-bold text-foreground">"{selectedAgent?.name}"</span> e todos os seus registros associados. Esta operação não pode ser desfeita.
          </p>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} className="uppercase font-bold text-[10px]">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteAgentMutation.mutate({ id: selectedAgent.id })}
              disabled={deleteAgentMutation.isPending}
              className="uppercase font-bold text-[10px]"
            >
              {deleteAgentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
